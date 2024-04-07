import {Schema, model} from "mongoose";

const athleteRecordsDataSchema = new Schema({
    $ref: {type: String, required: true},
    id: {type: String, required: true},
    type: {type: String, required: true},
    summary: {type: String, required: true},
    displayValue: {type: String, required: true},
    stats: [{
        name: {type: String, required: true},
        displayName: {type: String, required: true},
        abbreviation: {type: String, required: true},
        type: {type: String, required: true},
        value: {type: Number, required: true},
        displayValue: {type: String, required: true},
    }],
})

const athleteRecordsSchema = new Schema({
    data: athleteRecordsDataSchema,
    lastFetched: {type: Date, required: true},
});

export const AthleteRecordsModel = model('AthleteRecords', athleteRecordsSchema)
