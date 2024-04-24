import AdminJS, {AdminJSOptions} from "adminjs";
import {buildAuthenticatedRouter} from "@adminjs/express";
import AdminJSPrisma, {getModelByName} from "@adminjs/prisma";
import {NextFunction, Request, Response} from "express";
import session from 'express-session';
import {prisma} from "../prisma";
import bcrypt from "bcryptjs";
import MongoStore from "connect-mongo";
import {mongoUrl} from "../mongo";
import {componentLoader, Components} from "./components";

AdminJS.registerAdapter(AdminJSPrisma)
const adminOptions: AdminJSOptions = {
    componentLoader: componentLoader,
    resources: [
        {
            resource: {model: getModelByName('User'), client: prisma},
            options: {
                properties: {
                    password: {visible: false},
                }
            }
        },
        {
            resource: {model: getModelByName('Promotion'), client: prisma},
        },
        {
            resource: {model: getModelByName('Event'), client: prisma},
            options: {
                actions: {
                    getEvents: {
                        actionType: 'resource',
                        component: Components.GetEventsForPromotion,
                        // handler: (_request: any, _response: any, context: any) => {
                        //     console.log("Context: ", Object.keys(context));
                        //     return {
                        //         records: [] as any[],
                        //         msg: "Hello world"
                        //     }
                        // }
                    }
                }
            }
        },
        {
            resource: {model: getModelByName('Competition'), client: prisma},
        },
        {
            resource: {model: getModelByName('League'), client: prisma},
        },
        {
            resource: {model: getModelByName('LeagueSeason'), client: prisma},
        }
    ],
    rootPath: "/admin",
}

export const adminJs = new AdminJS(adminOptions);

export const buildAdminRouter = (admin: AdminJS) => {
    const router = buildAuthenticatedRouter(admin, {
            authenticate: async (email, password) => {
                const user = await prisma.user.findUnique({
                    where: {email: email},
                    select: {
                        password: true
                    }
                });
                if (!user) {
                    console.error("User not found")
                    return null;
                }
                const validPassword = await bcrypt.compare(password, user.password);
                if (validPassword) {
                    return {email: email, isAdmin: true};
                }
                console.error("Invalid password")
                return null
            },
            cookieName: "adminjs",
            cookiePassword: process.env["SESSION_KEY"],
        },
        null,
        {
            secret: process.env["SESSION_KEY"],
            resave: false,
            saveUninitialized: true,
        });
    // router.use(formidableMiddleware());
    return router;
}

export const adminSessionMiddleware = session({
    store: MongoStore.create({mongoUrl: mongoUrl}),
    secret: process.env["SESSION_KEY"],
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
});

export const isAdmin = (req: Request) => {
    // @ts-ignore
    return req.user && req.user?.isAdmin === true;
}
export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated) {
        return res.status(401).send("You need to sign in");
    }
    if (!isAdmin(req)) {
        return res.status(403).send("You need to be an admin to access this resource");
    }

    next();
}

