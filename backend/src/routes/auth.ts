import {Router} from "express";
import passport from "../services/passport";
import * as querystring from "querystring";

const authRouter = Router();

authRouter.get("/google", (req, res, next) => {
    console.log("REQUEST: ", req);
    const state = querystring.stringify({
        // @ts-ignore
        deviceId: Buffer.from(req.query["device_id"], 'base64'),
        // @ts-ignore
        csrfState: req.query["state"]
    });
    passport.authenticate("google", {scope: ["profile", "email"], state: state})(req, res, next);
})
authRouter.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: 'mmaoracle://login?error=true'
}), (req, res) => {
    const state = querystring.parse(req.query["state"] as string);
    return res.redirect(`mmaoracle://?token=${req.user}&state=${state["csrfState"]}`)
});

export default authRouter;
