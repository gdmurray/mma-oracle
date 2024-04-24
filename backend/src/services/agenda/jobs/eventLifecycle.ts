/**
 * Breakdown of Event Lifecycle Jobs
 * So to support more obscure leagues that aren't through the ESPN API, we'll need to have those events prefixed with live_
 * 1. event_should_be_visible: [Persistent] Every 6 Hours
 *      - Check if all competitions for an upcoming event have odds multipliers available in postgres
 *      - if so, set event to visible
 * 2. event_scheduler: [Persistent] Every Hour
 *      - Checks for any events that have their start date within 24 hours
 *      - Queue fetch_upcoming_event_competitions_odds with promotionId and eventId
 *      - If Event supports live polling [UFC, PFL, BELLATOR] -> start live_event_manager with promotionId and eventId
 *      - If Event does not support live polling -> start secondary_event_manager with promotionId and eventId
 *
 *  // LIVE EVENTS
 *  1. live_event_manager -> [Dynamic: {promotionId, eventId}] Runs Every 30 Minutes, 6 hours before event start date
 *      - Checks for any event changes and updates postgres accordingly
 *      - Queues first fight_scheduled task when event is an hour away, with the delay being when the event starts
 *      - So, first fight_scheduled task is at event_start
 *      - Checks if the next active fight is the current fight_scheduled to ensure consistency
 *      - Cancels fetch_upcoming_event_competitions_odds when event changes status to complete
 *      - Cleans up any other event related jobs when event is complete
 *      - Will also handle fight data updates, let's say the order of the bouts changes, or a fight is cancelled
 *          - If the fight is removed from the live list endpoint, we'll have to cancel the fight
 *  2. live_fight_scheduled -> [Dynamic: {promotionId, eventId, competitionId}] Runs Every 1 Minute
 *      - Checks current status on scheduled fight
 *      - If fight moves to active
 *          - Add live_fight_active to fetch live fight data for that active fight
 *          - Find Next Fight with an incremented matchNumber (if current matchNumber > 1)
 *          - Queue fight_scheduled for that next fight
 *          - Cancel Current live_fight_scheduled task
 * 3. live_fight_concluded -> [Dynamic: {promotionId, eventId, competitionId}] Runs Every 30 Seconds
 *      - Waits for the result of the fight to be in
 *      - Once the result is completed
 *          - it will push that change to the postgresql database
 *          - it will cancel itself
 *
 * // NON-LIVE -> Secondary Events
 * We will need to lock all competitions at fight time, but we will still be fetching the result of each fight, probably every 5 minutes? to avoid rate limiting errors
 * 1. secondary_event_manager -> [Dynamic: {promotionId, eventId}] Runs Every 30 Minutes, 1 hour before event start date
 *      - This queue will handle mostly everything that live_event_manager does, but without the live polling
 *      - Checks for fight changes and updates postgres accordingly
 *      - Checks for fight results and updates data accordingly
 *          - Needs to be able to handle postlims, because those aren't the main event (ie: BFL)
 *      - When last event is complete, it will cancel itself, and queue picks tasks -> TBD
 *
 *
 */

import {agenda} from "../agenda";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {prisma} from "../../prisma";

dayjs.extend(utc);


agenda.define("event_scheduler", async () => {
    const now = dayjs.utc()
    const twentyFourHoursFromNow = now.add(24, "hours")

    const liveEvents = ["ufc", "pfl", "bellator"]
    const events = await prisma.event.findMany({
        where: {
            date: {
                gte: now.toDate(),
                lt: twentyFourHoursFromNow.toDate(),
            },
        },
        select: {
            id: true,
            date: true,
            title: true,
            promotion: {
                select: {
                    slug: true
                }
            }
        }
    })

    for (const event of events) {
        // Get 6 hours before the event starts
        const beforeEvent = dayjs.utc(event.date).subtract(6, "hours")

        if (liveEvents.includes(event.promotion.slug)) {
            const liveEventManager = agenda.create("live_event_manager", {
                promotionId: event.promotion.slug,
                eventId: event.id
            });
            liveEventManager.schedule(beforeEvent.toDate())
            liveEventManager.repeatEvery("30 minutes")
            liveEventManager.unique({"data.promotionId": event.promotion.slug, "data.eventId": event.id})
            await liveEventManager.save();
        } else {
            // TODO: Write classes for each Promotion and handle the secondary event manager
            const secondaryEventManager = agenda.create("secondary_event_manager", {
                promotionId: event.promotion.slug,
                eventId: event.id
            });
            secondaryEventManager.schedule(beforeEvent.toDate())
            secondaryEventManager.repeatEvery("30 minutes")
            secondaryEventManager.unique({"data.promotionId": event.promotion.slug, "data.eventId": event.id})
            await secondaryEventManager.save();
        }
    }
})

// TODO: Write promotion classes that fetch the event and fight data for each promotion
// TODO: Common classes would be an ESPNPromotion or a TapologyPromotion
agenda.define("live_event_manager", async (job: any) => {
    const {promotionId, eventId} = job.attrs.data;
    console.log(promotionId, eventId);
    // This is where we will fetch the event data every 30 minutes, go over each competition, and check if anything changes, if so, update odds
});


