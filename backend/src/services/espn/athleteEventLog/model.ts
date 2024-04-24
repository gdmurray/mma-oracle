import mongoose, {Schema, model} from "mongoose";

export const AthleteEventSchema = new Schema({
    event: {
        $ref: {type: String, required: true},
    },
    competition: {
        $ref: {type: String, required: true},
    },
    played: {type: Boolean, required: true},
});

export const AthleteEventLogDataSchema = new Schema({
    $ref: {type: String, required: true},
    athleteId: {type: String, required: true},
    events: [AthleteEventSchema]
})

export const AthleteEventLogSchema = new Schema({
    data: AthleteEventLogDataSchema,
    lastFetched: {type: Date, required: true},
})

export const AthleteEventLogModel = mongoose.models["AthleteEventLog"] || model("AthleteEventLog", AthleteEventLogSchema);
