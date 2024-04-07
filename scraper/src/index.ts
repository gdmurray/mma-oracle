import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {CalendarService} from "./services/calendar/service";
import eventsRouter from "./routes/events";
import modelRouter from "./routes/model/router";
import {agenda} from "./services/agenda";
import morgan from 'morgan';


import cluster from "cluster";
import os from "os";
import * as process from "process";


const totalCPUs = os.cpus().length;

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
    dotenv.config();
}

function getMongoUrl(): string {
    const mongoUrl = process.env["MONGODB_URL"];
    if (mongoUrl == null && isProduction) {
        if (isProduction) {
            const mongoVars = {
                MONGODB_NAME: process.env["MONGODB_NAME"],
                MONGODB_USER: process.env["MONGODB_USER"],
                MONGODB_PASSWORD: process.env["MONGODB_PASSWORD"],
                MONGODB_HOST: process.env["MONGODB_HOST"] ?? "mongodb",
                MONGODB_PORT: process.env["MONGODB_PORT"] ?? 27017,
                MONGODB_CONNECTION: process.env["MONGODB_CONNECTION"] ?? "mongodb",
            }
            for (const [key, value] of Object.entries(mongoVars)) {
                if (value == null) {
                    console.error(`${key} is not defined`);
                    process.exit(1);
                }
            }
            let {
                MONGODB_NAME: name,
                MONGODB_USER: user,
                MONGODB_PASSWORD: password,
                MONGODB_HOST: host,
                MONGODB_PORT: port,
                MONGODB_CONNECTION: connection
            } = mongoVars;
            user = encodeURIComponent(user);
            password = encodeURIComponent(password);
            name = encodeURIComponent(name);
            return `${connection}://${user}:${password}@${host}:${port}/${name}?authSource=admin`;
        }
        console.error("MONGODB_URL is not defined");
        process.exit(1);
    }
    return mongoUrl;
}

const mongoUrl = getMongoUrl();

async function startAgenda() {
    await agenda.start();
    console.log('Agenda started!');
}


// Connect to MongoDB
mongoose.connect(mongoUrl,)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

if (cluster.isPrimary && isProduction) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, _code, _signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log('Forking a new worker');
        cluster.fork(); // Optional: Restart worker on exit
    });
} else {
    const workerString = isProduction ? `Worker ${process.pid}` : 'App';
    console.log(`${workerString} is starting...`);
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
}





