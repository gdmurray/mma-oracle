export type DraftKingsResponse = {
    eventGroup: EventGroup;
}

type EventGroup = {
    eventGroupId: string;
    displayGroupId: string;
    name: string;
    offerCategories: OfferCategory[];
    events: Event[];
}

type OfferCategory = {
    offerCategoryId: number;
    name: string;
    offerSubcategoryDescriptors?: OfferSubcategoryDescriptor[];
}

type OfferSubcategoryDescriptor = {
    subcategoryId: number;
    name: string;
    offerSubcategory?: OfferSubcategory;
}

type OfferSubcategory = {
    name: string;
    subcategoryId: number;
    componentId: number;
    offers: Offer[][];
}

type Offer = {
    providerOfferId: string;
    eventId: string;
    eventGroupId: string;
    label: string;
    isSuspended: boolean;
    isOpen: boolean;
    offerSubcategoryId: number;
    isSubcategoryFeatured: boolean;
    betOfferTypeId: number;
    providerCriterionId: string;
    outcomes: Outcome[];
    offerSequence: number;
    source: string;
    displayGroupId: string;
    main: boolean;
    tags: string[];
}

type Outcome = {
    providerOutcomeId: string;
    providerId: number;
    providerOfferId: string;
    label: string;
    oddsAmerican: string;
    oddsDecimal: number;
    oddsDecimalDisplay: string;
    oddsFractional: string;
    participant: string;
    participantType: string;
    sortOrder: number;
    participants: Participant[];
}

type Participant = {
    name: string;
    type: string;
}

type Event = {
    eventId: string;
    displayGroupId: string;
    eventGroupId: string;
    eventGroupName: string;
    name: string;
    nameIdentifier: string;
    startDate: string;
    teamName1: string;
    teamName2: string;
    teamShortName1: string;
    teamShortName2: string;
    team1: Team;
    team2: Team;
    eventStatus: EventStatus;
    eventScorecard: EventScorecard;
    liveBettingOffered: boolean;
    liveBettingEnabled: boolean;
    tags: string[];
    flashBetOfferCount: number;
    eventMetadata: EventMetadata;
    isSameGameParlayEligible?: boolean;
}

type Team = {
    name: string;
}

type EventStatus = {
    state: string;
    isClockDisabled: boolean;
    minute: number;
    second: number;
    isClockRunning: boolean;
}

type EventScorecard = {
    scorecardComponentId: number;
}

type EventMetadata = {
    participantMetadata?: any; // This could be defined more specifically if the structure is known.
}
