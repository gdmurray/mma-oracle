import express, {NextFunction, Request, Response} from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import {mongoUrl} from "./services/mongo";
import passport from "./services/passport";
import {adminJs, adminSessionMiddleware, buildAdminRouter} from "./services/admin/admin";
import apiRouter from "./routes/api";
import {selectMasterAgendaNode} from "./services/agenda/agenda";

// Connect to MongoDB
mongoose.connect(mongoUrl,)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));


const app = express();
const port = process.env['PORT'] || 3000;

app.use(morgan('combined'));
app.use(passport.initialize());

// Select Agenda node
selectMasterAgendaNode();

// Admin Routes
app.use("/admin", adminSessionMiddleware, (req, res, next) => {
    passport.session()(req, res, next);
}, buildAdminRouter(adminJs));

// Watch Admin Build in Development
if (process.env.NODE_ENV !== 'production') {
    adminJs.watch();
}

// API Routes
app.use("/api", apiRouter);
app.get('/health', express.json(), (_req, res) => res.status(200).send('OK'));


// TODO: Move All Middleware to it's own file
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    return res.status(500).json({error: 'Something went wrong'});
})

app.use((req, _res, next) => {
    const now = new Date();
    console.log(`${now.toISOString()} - ${req.method} ${req.path}`);
    next(); // Pass control to the next handler
});

// Check master node every minute
setInterval(selectMasterAgendaNode, 60000);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});




