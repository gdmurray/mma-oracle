import * as z from "zod";


const Outcome = z.object({
    providerOutcomeId: z.string(),
    providerId: z.number(),
    providerOfferId: z.string(),
    label: z.string(),
    oddsAmerican: z.string(),
    oddsDecimal: z.number(),
    oddsDecimalDisplay: z.string(),
    oddsFractional: z.string(),
    participant: z.string().optional().or(z.literal("")),
    participantType: z.string(),
    sortOrder: z.number(),
    participants: z.array(z.object({
        name: z.string().optional(),
        type: z.string().optional()
    })).optional()
})
const Offer = z.object({
    providerOfferId: z.string(),
    eventId: z.string(),
    eventGroupId: z.string(),
    label: z.string(),
    isSuspended: z.boolean(),
    isOpen: z.boolean(),
    offerSubcategoryId: z.number(),
    providerCriterionId: z.string(),
    outcomes: z.array(Outcome),
    displayGroupId: z.string(),
});

const OfferSubcategory = z.object({
    name: z.string(),
    subcategoryId: z.number(),
    componentId: z.number(),
    offers: z.array(z.array(Offer))
});
const OfferSubcategoryDescriptor = z.object({
    subcategoryId: z.number(),
    name: z.string(),
    offerSubcategory: OfferSubcategory.optional(),
});

const OfferCategory = z.object({
    offerCategoryId: z.number(),
    name: z.string(),
    offerSubcategoryDescriptors: z.array(OfferSubcategoryDescriptor).optional()
})

const Event = z.object({
    eventId: z.string(),
    eventGroupId: z.string(),
    displayGroupId: z.string(),
    name: z.string(),
    nameIdentifier: z.string(),
    teamName1: z.string(),
    teamName2: z.string(),
    team1: z.object({
        name: z.string()
    }),
    team2: z.object({
        name: z.string()
    }),
    eventStatus: z.object({
        state: z.string(),
        isClockDisabled: z.boolean(),
        minute: z.number(),
        second: z.number(),
        isClockRunning: z.boolean(),
    })
})

const EventGroup = z.object({
    eventGroupId: z.string(),
    displayGroupId: z.string(),
    name: z.string(),
    offerCategories: z.array(OfferCategory),
    events: z.array(Event)
})

export const DraftKingsValidator = z.object({
    eventGroup: EventGroup,
})

export type ParsedDraftKingsResponse = z.infer<typeof DraftKingsValidator>;
