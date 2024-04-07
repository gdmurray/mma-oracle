import {model, Schema} from "mongoose";

const fighterOddsSchema = new Schema({
    moneyLine: {type: String},
    byTKO: {type: String},
    bySubmission: {type: String},
    byDecision: {type: String},

})
const competitionOddsSchema = new Schema({
    competitionId: {type: String, required: true},
    fighterOne: {type: fighterOddsSchema},
    fighterTwo: {type: fighterOddsSchema},
})

const oddsSchema = new Schema({
    eventName: {type: String, required: true},
    eventId: {type: String, required: true},
    url: [{type: String}],
    competitions: [competitionOddsSchema]
});

export const EventOddsModel = model('EventOdds', oddsSchema)
