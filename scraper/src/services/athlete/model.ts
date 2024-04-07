import {model, Schema} from "mongoose";

const athleteDetailData = new Schema({
    id: {type: String, required: true},
    uid: {type: String},
    guid: {type: String},
    firstName: {type: String, required: true},
    lastName: {type: String},
    fullName: {type: String, required: true},
    displayName: {type: String, required: true},
    nickname: {type: String},
    shortName: {type: String},
    weight: {type: Number},
    displayWeight: {type: String},
    height: {type: Number},
    displayHeight: {type: String},
    age: {type: Number},
    dateOfBirth: {type: Date},
    gender: {type: String},
    citizenship: {type: String},
    citizenshipCountry: {
        alternateId: {type: String},
        abbreviation: {type: String},
        color: {type: String},
        alternateColor: {type: String},
    },
    headshot: {
        href: {type: String},
        alt: {type: String},
        rel: {type: [String]},
    },
    flag: {
        href: {type: String},
        alt: {type: String},
        rel: {type: [String]},
    },
    statistics: {
        $ref: {type: String},
    },
    records: {
        $ref: {type: String},
    },
    eventLog: {
        $ref: {type: String},
    },
    images: [{
        href: {type: String},
        alt: {type: String},
        rel: {type: [String]},
    }],
})

const athleteDetailSchema = new Schema({
    data: athleteDetailData,
    lastFetched: {type: Date, required: true}
});

export const AthleteDetailModel = model('AthleteDetail', athleteDetailSchema)
