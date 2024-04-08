import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {CalendarService} from "./services/calendar/service";
import eventsRouter from "./routes/events";
import modelRouter from "./routes/model/router";
import {agenda} from "./services/agenda";
import morgan from 'morgan';
import {mongoUrl} from "./env";

console.log("Starting Application!");


async function startAgenda() {
    await agenda.start();
    console.log('Agenda started!');
}


// Connect to MongoDB
mongoose.connect(mongoUrl,)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));


const app = express();
const port = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    return res.status(500).json({error: 'Something went wrong'});
})

app.use((req, _res, next) => {
    const now = new Date();
    console.log(`${now.toISOString()} - ${req.method} ${req.path}`);
    next(); // Pass control to the next handler
});

// Define a route
app.get('/calendar', async (_req, res) => {
    const service = new CalendarService();
    const calendarResponse = await service.get();
    return res.status(200).json({data: JSON.stringify(calendarResponse)})
});

app.get('/health', (_req, res) => res.status(200).send('OK'));

app.use("/events", eventsRouter)
app.use("/model", modelRouter);

startAgenda().catch(error => console.error(error));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});




