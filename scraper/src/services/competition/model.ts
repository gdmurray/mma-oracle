import {model, Schema} from "mongoose";

const CompetitorSchema = new Schema({
    $ref: {type: String, required: true},
    id: {type: String, required: true},
    uid: {type: String},
    order: {type: Number},
    winner: {type: Boolean},
    athlete: {
        $ref: {type: String},
    }
})

export const CompetitionDataSchema = new Schema({
    $ref: {type: String, required: true},
    id: {type: String, required: true},
    guid: {type: String},
    uid: {type: String},
    description: {type: String},
    date: {type: Date},
    endDate: {type: Date},
    lastUpdated: {type: Date},
    type: {
        id: {type: String},
        text: {type: String},
        abbreviation: {type: String},
    },
    competitors: [CompetitorSchema],
    status: {
        $ref: {type: String}
    },
    format: {
        regulation: {
            periods: {type: Number},
            displayName: {type: String},
            slug: {type: String},
            clock: {type: Number},
        }
    },
    odds: {
      $ref: {type: String},
    },
    cardSegment: {
        id: {type: String},
        description: {type: String},
        name: {type: String},
    },
    matchNumber: {type: Number},
})

const CompetitionSchema = new Schema({
    data: CompetitionDataSchema,
    lastFetched: {type: Date, required: true}
})

export const CompetitionModel = model('Competition', CompetitionSchema)
