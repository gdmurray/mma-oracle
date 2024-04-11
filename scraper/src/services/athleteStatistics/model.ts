import mongoose, {model, Schema} from "mongoose";


const AthleteStatisticsStatSchema = new Schema({
    name: {type: String, required: true},
    displayName: {type: String, required: true},
    shortDisplayName: {type: String, required: true},
    description: {type: String, required: true},
    abbreviation: {type: String, required: true},
    value: {type: Number, required: true},
    displayValue: {type: String, required: true},
});

const AthleteStatisticsCategorySchema = new Schema({
    name: {type: String, required: true},
    displayName: {type: String, required: true},
    abbreviation: {type: String, required: true},
    summary: {type: String},
    stats: [AthleteStatisticsStatSchema]
})

const AthleteStatisticsDataSchema = new Schema({
    $ref: {type: String, required: true},
    athlete: {
        $ref: {type: String, required: true},
    },
    splits: {
        id: {type: String, required: true},
        name: {type: String, required: true},
        abbreviation: {type: String, required: true},
        type: {type: String, required: true},
        categories: [AthleteStatisticsCategorySchema],
    }
})

const AthleteStatisticsSchema = new Schema({
    data: AthleteStatisticsDataSchema,
    lastFetched: {type: Date, required: true},
});

export const AthleteStatisticsModel =  mongoose.models["AthleteStatistics"] || model('AthleteStatistics', AthleteStatisticsSchema)
