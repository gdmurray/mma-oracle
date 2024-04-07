import {Schema, model} from "mongoose";

const OddsLineSchema = new Schema({
    value: {type: Number},
    displayValue: {type: String},
    alternateDisplayValue: {type: String},
    decimal: {type: Number},
    fraction: {type: String},
    american: {type: String},
})

const AthleteOddsSchema = new Schema({
    favorite: {type: Boolean},
    underdog: {type: Boolean},
    moneyLine: {type: Number},
    open: OddsLineSchema,
    close: OddsLineSchema,
    current: OddsLineSchema,
})

const CompetitionOddsSchema = new Schema({
    $ref: {type: String, required: true},
    provider: {
        $ref: {type: String, required: true},
        id: {type: String},
        name: {type: String, required: true},
        priority: {type: Number},
    },
    details: {type: String},
    overUnder: {type: Number},
    awayAthleteOdds: AthleteOddsSchema,
    homeAthleteOdds: AthleteOddsSchema,
})

const CompetitionOddsContainerSchema = new Schema({
    competitionId: {type: String},
    items: [CompetitionOddsSchema],
})

const CompetitionOddsDataSchema = new Schema({
    data: CompetitionOddsContainerSchema,
    lastFetched: {type: Date},
})

export const CompetitionOddsModel = model("CompetitionOdds", CompetitionOddsDataSchema);
