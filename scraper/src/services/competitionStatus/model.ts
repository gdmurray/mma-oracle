import {model, Schema} from "mongoose";

const CompetitionStatusDataSchema = new Schema({
    $ref: {type: String, required: true},
    clock: {type: Number},
    displayClock: {type: String},
    period: {type: Number},
    type: {
        id: {type: String},
        name: {type: String},
        state: {type: String},
        completed: {type: Boolean},
        description: {type: String},
        detail: {type: String},
        shortDetail: {type: String},
    },
    result: {
        id: {type: Number},
        name: {type: String},
        displayName: {type: String},
        description: {type: String},
        displayDescription: {type: String},
        shortDisplayName: {type: String},
        target: {
            id: {type: Number},
            name: {type: String},
            description: {type: String},
            displayDescription: {type: String},
        }
    }
})

const CompetitionStatusSchema = new Schema({
    data: CompetitionStatusDataSchema,
    lastFetched: {type: Date, required: true}
})

export const CompetitionStatusModel = model('CompetitionStatus', CompetitionStatusSchema)
