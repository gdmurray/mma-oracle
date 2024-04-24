import mongoose, {model, Schema} from "mongoose";

export const LeagueDataSchema = new Schema({
    $ref: {type: String, required: true},
    id: {type: String, required: true},
    guid: {type: String},
    uid: {type: String},
    name: {type: String, required: true},
    displayName: {type: String, required: true},
    abbreviation: {type: String, required: true},
    shortName: {type: String, required: true},
    slug: {type: String, required: true},
    seasons: {
        $ref: {type: String},
    },
    events: {
        $ref: {type: String},
    },
    calendar: {
        $ref: {type: String},
    },
    season: {
        year: {type: Number, required: true},
        startDate: {type: String, required: true},
        endDate: {type: String, required: true},
        displayName: {type: String, required: true},
    }
})

const LeagueDetailSchema = new Schema({
    data: LeagueDataSchema,
    lastFetched: {type: Date, required: true},
})

export const LeagueDetailModel = mongoose.models["League"] || model('League', LeagueDetailSchema)

