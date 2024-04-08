import Agenda from "agenda";
import {EventService} from "./event/service";
import {CompetitionService} from "./competition/service";
import {CompetitionStatusService} from "./competitionStatus/service";
import {mongoUrl} from "./mongo";

export const agenda = new Agenda({db: {address: mongoUrl}});

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
})

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
