import {EventService} from "../espn/event/service";
import {CompetitionService} from "../espn/competition/service";
import {CompetitionStatusService} from "../espn/competitionStatus/service";
import {agenda} from "./agenda";

/**
 * Jobs Required for MMA Oracle Backend
 * 1. Data Hydration Jobs
 * a) Fetch Upcoming Events for Each League and Sync with Postgresql -> Every 6 Hours
 * b) Fetch Upcoming Competitions for Each Event and Sync with Postgresql -> Every 6 Hours
 *
 * 2. Odds Jobbs
 * a) Fetch/Generate Odds for each competition for fights in the next 3 weeks and sync with Postgresql -> Every 6 Hours
 *
 * 3. Event Visibility Jobs
 * a) Check if all competitions for an upcoming event have odds multipliers available in postgres, if so, set event to visible -> Every 6 Hours
 *
 * 4. Event Lifecycle Jobs
 * a) Check if nearing the start time of any event that supports live polling
 * b) event_scheduler -> Runs every hour, checks for any events that support live polling,
 *      - if event falls on today, start event_manager with a delay to 6 hours before event start
 * c) live_event_manager -> Runs Every 30 minutes, starts 6 hours before event,
 *      - checks for any event changes and updates Postgres
 *      - Queues first fight_scheduled task when event is an hour away, with the delay being when the event starts
 *      - So, first fight_scheduled task is at event_start
 *      - Checks if the next active fight is the current fight_scheduled to ensure consistency
 *      - Cancels fetch_upcoming_event_competitions_odds when event changes status to complete
 *      - Cleans up any other event related jobs when event is complete
 * b) fight_scheduled -> Every 1 Minute? Or should it be closer depending on current matchNumber
 *      - We could scale the interval by matchNumber, so last number is polled more frequently, then polling changes as the fights change
 *      - Would that be hard to modify the schedule of a job
 *      - Fetches live data for a scheduled fight, if fight starts, cancel that task and start
 * c) fight_active ->
 */
agenda.define('setup_competition_jobs', async (job: any) => {
    const eventService = new EventService({eventId: job.attrs.data.eventId});
    const eventData = await eventService.get();
    for (const competition of eventData.competitions) {
        // const jobId = `fight_scheduled_${eventData.id}_${competition.id}`
        const competitionJob = agenda.create('fight_scheduled', {competitionId: competition.id, eventId: eventData.id});
        competitionJob.repeatEvery('1 minute');
        await competitionJob.save();
        // await agenda.every('1 minute', 'fight_scheduled', {competitionId: competition.id, eventId: eventData.id}, {jobId});
    }
});

// This would Run every 6 hours to fetch the upcoming event schedule
agenda.define('hydrate_events', async (job: any) => {
    console.log("Scanning upcoming events: ", Object.keys(job));
})

// This would also run every 6 hours, and would only get events that are scheduled to happen in the next 14 days
agenda.define('hydrate_competitions', async (job: any) => {
    console.log("Scanning upcoming competitions: ", Object.keys(job));
});

agenda.define('fight_scheduled', async (job: any) => {
    console.log("Fight Scheduled Job", job.attrs.data);
    const {competitionId, eventId} = job.attrs.data;
    const competitionService = new CompetitionService({
        competitionId,
        eventId
    }, {live: true, services: {}});
    const competitionStatusService = new CompetitionStatusService({competitionId, eventId}, {live: true, services: {}});
    const status = await competitionStatusService.get();
    if (status.type.state === "in") {
        await competitionService.saveToCache();
        await competitionStatusService.saveToCache();
        const newJob = agenda.create('fight_active', {competitionId, eventId});
        newJob.repeatEvery('30 seconds');
        await newJob.save();
        console.log("QUEUED NEW ACTIVE FIGHT JOB");
        const jobCancelled = await agenda.cancel({
            name: "fight_scheduled",
            "data.eventId": eventId,
            "data.competitionId": competitionId
        });
        if (jobCancelled > 0) {
            console.log("CANCELLED JOB BECAUSE FIGHT IS ACTIVE")
        }
    } else if (status.type.state === "post") {
        await competitionService.saveToCache();
        await competitionStatusService.saveToCache();
        const newJob = agenda.create("fight_concluded", {competitionId, eventId});
        newJob.repeatEvery('30 seconds');
        await newJob.save();
        console.log("QUEUED NEW CONCLUDED FIGHT JOB");
        const jobCancelled = await agenda.cancel({
            name: "fight_scheduled",
            "data.eventId": eventId,
            "data.competitionId": competitionId
        });
        if (jobCancelled > 0) {
            console.log("CANCELLED JOB BECAUSE FIGHT IS ACTIVE")
        }
    }
})

agenda.define('fight_active', async (job: any) => {
    console.log("Fight Active Job", job.attrs.data);
    const {competitionId, eventId} = job.attrs.data;
    const competitionService = new CompetitionService({
        competitionId,
        eventId
    }, {live: true, services: {}});
    const competitionStatusService = new CompetitionStatusService({competitionId, eventId}, {live: true, services: {}});
    const status = await competitionStatusService.get();
    console.log("Active Fight Data: ", status, status.type.state);
    if (status.type.state === "post") {
        console.log("FIGHT IS OVER")
        await competitionService.saveToCache();
        await competitionStatusService.saveToCache();
        console.log("FIGHT SAVED TO CACHE")
        const newJob = agenda.create("fight_concluded", {competitionId, eventId});
        newJob.repeatEvery('30 seconds');
        await newJob.save();
        console.log("QUEUED NEW CONCLUDED FIGHT JOB");
        const jobCancelled = await agenda.cancel({
            name: "fight_active",
            "data.eventId": eventId,
            "data.competitionId": competitionId
        });
        if (jobCancelled > 0) {
            console.log("CANCELLED JOB BECAUSE FIGHT IS CONCLUDED")
        }
    }
    // const {competitionId, eventId} = job.attrs.data;
})

agenda.define('fight_concluded', async (job: any) => {
    console.log("Fight Concluded Job", job.attrs.data);
    const {competitionId, eventId} = job.attrs.data;
    const competitionService = new CompetitionService({
        competitionId,
        eventId
    }, {live: true, services: {}});
    const competitionStatusService = new CompetitionStatusService({competitionId, eventId}, {live: true, services: {}});
    const status = await competitionStatusService.get();
    if (status.result != null && Object.keys(status.result).length > 0 && status.result.name != null) {
        await competitionService.saveToCache();
        await competitionStatusService.saveToCache();
        const jobCancelled = await agenda.cancel({
            name: "fight_concluded",
            "data.eventId": eventId,
            "data.competitionId": competitionId
        });
        if (jobCancelled > 0) {
            console.log("CANCELLED JOB BECAUSE FIGHT IS OVER")
        }
    }

})

agenda.define('fight_results', async (job: any) => {
    console.log('fight_results job', job);
})
