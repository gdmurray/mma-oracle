import {Strategy as JwtStrategy, ExtractJwt, StrategyOptions} from 'passport-jwt';
import {Strategy as LocalStrategy} from 'passport-local';
import passport from 'passport';
import {prisma} from "./prisma";
import bcrypt from 'bcryptjs';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import * as querystring from "querystring";

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env['PASSPORT_SECRET_KEY'] || 'mmaoracle',  // Ensure to use environment variables for production
};

passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: jwt_payload.id}
        });
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {email: email}
        });
        if (!user) {
            return done(null, false, {message: 'Incorrect email'});
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return done(null, false, {message: 'Incorrect password'});
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}))

passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'] || 'google_client_id',
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || 'google_client_secret',
    callbackURL: "/auth/google/callback",
    passReqToCallback: true,
}, async (req, _accessToken, _refreshToken, profile, done) => {
    if (profile != null) {
        const state = querystring.parse(req.query["state"] as string);
        const deviceId = state["deviceId"] as string;
        console.log("DeviceId: ", deviceId);
        const {displayName, emails, id} = profile;
        const email = emails.find(elem => elem.verified);
        if (email != null) {
            let user = await prisma.user.findUnique({
                where: {email: email.value}
            })
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: displayName,
                        email: email.value,
                        deviceId: deviceId,
                        authCredentials: {
                            create: {
                                uid: id,
                                provider: 'GOOGLE',
                            }
                        }
                    }
                })
            }
            const token = jwt.sign({
                id: user.id,
                email: user.email,
            }, process.env['PASSPORT_SECRET_KEY'] || 'mmaoracle', {expiresIn: '1d'});
            return done(null, token);
        }
    }
    return done(new Error("Callback did not return profile"), null);
}));

export default passport;
