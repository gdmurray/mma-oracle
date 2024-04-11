import mongoose, {model, Schema} from "mongoose";
import {CompetitionDataSchema} from "../competition/model";

// Define the Type schema for the nested 'type' object inside 'status'
const StatusTypeSchema = new Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    state: {type: String, required: true},
    completed: {type: Boolean, required: true},
    description: {type: String, required: true},
    detail: {type: String, required: true},
});

const StatusSchema = new Schema({
    type: StatusTypeSchema
});
export const EventDetailDataSchema = new Schema({
    $ref: {type: String, required: true},
    id: {type: String, required: true},
    guid: {type: String},
    uid: {type: String},
    date: {type: Date, required: true},
    name: {type: String, required: true},
    season: {
        $ref: {type: String},
    },
    seasonType: {
        $ref: {type: String},
    },
    timeValid: {type: Boolean, required: true},
    competitions: [CompetitionDataSchema],
    status: StatusSchema,
})

const EventDetailSchema = new Schema({
    data: EventDetailDataSchema,
    lastFetched: {type: Date, required: true},
})

export const EventDetailModel = mongoose.models["EventDetail"] || model('EventDetail', EventDetailSchema)
