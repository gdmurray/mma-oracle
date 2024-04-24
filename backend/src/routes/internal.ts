import express, {Router} from "express";
import eventsRouter from "./events";
import modelRouter from "./model";
import promotionRouter from "./promotion";
import {CalendarService} from "../services/espn/calendar/service";

// TODO: Add Middleware that ensures these routes are only accessible internally (not from external apis)
const internalRouter = Router();

internalRouter.use("/events", eventsRouter);
internalRouter.use("/model", modelRouter);
internalRouter.use("/promotion", promotionRouter);
internalRouter.get('/calendar', express.json(), async (_req, res) => {
    const service = new CalendarService();
    const calendarResponse = await service.get();
    return res.status(200).json({data: JSON.stringify(calendarResponse)})
});
export default internalRouter;
