import {Router} from "express";
import {CompetitionService} from "../services/competition/service";
// import {PredictionService} from "../services/predictions";
import {DraftKingsCompetitionOddsService} from "../services/draftkingsCompetitionOdds/service";
import {EventDetailModel} from "../services/event/model";
import dayjs from "dayjs";
import {CalendarService} from "../services/calendar/service";
import {EventService} from "../services/event/service";
import {agenda} from "../services/agenda";

const eventsRouter: Router = Router();

// This route fetches either the next active, or currently active event...
eventsRouter.get("/", async (_req, res) => {
    const today = dayjs();
    const plusToday = today.add(1, "day");
    const minusToday = today.subtract(1, "day");
    const calendarService = new CalendarService();
    const calendarData = await calendarService.get();
    const pastEvents = calendarData.filter((elem) => elem.startDate < minusToday.toDate());
    const activeEvent = calendarData.find((elem) => elem.startDate >= minusToday.toDate() && elem.startDate <= plusToday.toDate());
    const futureEvents = calendarData.filter((elem) => elem.startDate >= plusToday.toDate()).slice(0, 5);
    return res.status(200).json({activeEvent, futureEvents, pastEvents});
})
eventsRouter.get("/active", async (_req, res) => {
    const calendarService = new CalendarService();
    const calendarData = await calendarService.get();
    console.log("Calendar Data: ", calendarData);
    const today = dayjs();
    const plusToday = today.add(1, "day");
    const minusToday = today.subtract(1, "day");
    const activeEvent = await EventDetailModel.findOne({
        'data.date': {
            $gte: minusToday.toDate(),
            $lte: plusToday.toDate(),
        }
    }).sort({lastFetched: -1}) // Sort by date in descending order
        .exec(); // Execute the query;
    console.log("Active Event: ", activeEvent);
    return res.status(200).json({message: "success"})
})

eventsRouter.get("/:eventId", async (req, res) => {
    const {eventId} = req.params;
    const service = new EventService({eventId});
    const data = await service.get();
    const eventJob = await agenda.jobs({name: "setup_competition_jobs", "data.eventId": eventId});
    // console.log("Data: ", data);
    // console.log("Received EventJob: ", eventJob)
    if (eventJob.length === 0) {
        console.log("No eventjobs found: ", eventJob);
        await agenda.now('setup_competition_jobs', {eventId});
    }
    return res.status(200).json({event: data});
})

eventsRouter.get("/:eventId/competitions/:competitionId", async (req, res) => {
    const {eventId, competitionId} = req.params;
    const service = new CompetitionService({eventId, competitionId}, {services: {athlete: "AthleteService", status: "CompetitionStatusService"}});
    const data = await service.get();
    return res.status(200).json({data: data})
});

eventsRouter.get("/:eventId/competitions/:competitionId/status", async (req, res) => {
    const {live} = req.query;
    const {eventId, competitionId} = req.params;
    const isLive = live && (live as string).toLowerCase() === "true";
    const service = new CompetitionService({eventId, competitionId}, {
        services: {
            status: "CompetitionStatusService",
            athlete: "AthleteService"
        }
    });
    const data = await service.get();
    console.log("Service Status Data: ", data);
    return res.status(200).json({live: isLive})
});

eventsRouter.get("/:eventId/competitions/:competitionId/odds", async (req, res) => {
    const {eventId, competitionId} = req.params;

    // Competition Service
    const service = new CompetitionService({eventId, competitionId}, {
        services: {
            odds: "CompetitionOddsService",
            athlete: "AthleteService"
        }
    });
    const competition = await service.get();

    // DraftKings Service Odds
    const draftKingsOddsService = new DraftKingsCompetitionOddsService({competition});
    const draftKingsOdds = await draftKingsOddsService.get();
    console.log("DraftKings Odds: ", draftKingsOdds);
    // const predictionService = new PredictionService(competition);
    // const predictions = await predictionService.getPredictions();
    // console.log("Odds Prediction: ", predictions);
    return res.status(200).end();
})

export default eventsRouter;
