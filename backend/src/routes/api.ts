import express, {Router} from "express";
import cors from "cors";
import authRouter from "./auth";
import internalRouter from "./internal";

const apiRouter = Router();
apiRouter.use(cors());
apiRouter.use(express.json());
apiRouter.use(express.urlencoded({extended: false}));
apiRouter.use("/auth", authRouter);
apiRouter.use("/internal", internalRouter);

export default apiRouter;
