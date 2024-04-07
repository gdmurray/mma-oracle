import {Schema, model} from "mongoose";

const Outcome = new Schema({
    providerOutcomeId: {type: String, required: true},
    providerId: {type: Number, required: true},
    providerOfferId: {type: String, required: true},
    label: {type: String, required: true},
    oddsAmerican: {type: String, required: true},
    oddsDecimal: {type: Number, required: true},
    oddsDecimalDisplay: {type: String, required: true},
    oddsFractional: {type: String, required: true},
    participant: {type: String},
    participantType: {type: String, required: true},
    sortOrder: {type: Number, required: true},
    participants: [{name: {type: String}, type: {type: String}}]
})

const Offer = new Schema({
    providerOfferId: {type: String, required: true},
    eventId: {type: String, required: true},
    eventGroupId: {type: String, required: true},
    label: {type: String, required: true},
    isSuspended: {type: Boolean, required: true},
    isOpen: {type: Boolean, required: true},
    offerSubcategoryId: {type: Number, required: true},
    providerCriterionId: {type: String, required: true},
    outcomes: [Outcome],
    displayGroupId: {type: String, required: true},
})

const OfferSubcategory = new Schema({
    name: {type: String, required: true},
    subcategoryId: {type: Number, required: true},
    componentId: {type: Number, required: true},
    offers: [[Offer]]
})

const OfferSubcategoryDescriptor = new Schema({
    subcategoryId: {type: Number, required: true},
    name: {type: String, required: true},
    offerSubcategory: OfferSubcategory
})

const OfferCategory = new Schema({
    offerCategoryId: {type: Number, required: true},
    name: {type: String, required: true},
    offerSubcategoryDescriptors: [OfferSubcategoryDescriptor]
})

const Event = new Schema({
    eventId: {type: String, required: true},
    eventGroupId: {type: String, required: true},
    displayGroupId: {type: String, required: true},
    name: {type: String, required: true},
    nameIdentifier: {type: String, required: true},
    teamName1: {type: String, required: true},
    teamName2: {type: String, required: true},
    team1: {name: {type: String}},
    team2: {name: {type: String}},
    eventStatus: {
        state: {type: String, required: true},
        isClockDisabled: {type: Boolean, required: true},
        minute: {type: Number},
        second: {type: Number},
        isClockRunning: {type: Number},
    }
})

const EventGroup = new Schema({
    eventGroupId: {type: String, required: true},
    displayGroupId: {type: String, required: true},
    name: {type: String, required: true},
    offerCategories: [OfferCategory],
    events: [Event]
})

const DraftKingsDataSchema = new Schema({
    eventGroup: EventGroup
})

const DraftKingsSchema = new Schema({
    data: DraftKingsDataSchema,
    lastFetched: {type: Date}
})

export const DraftKingsModel = model("DraftKings", DraftKingsSchema);

