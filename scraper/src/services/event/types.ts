export type Event = {
    $ref: string;
    id: string;
    guid: string;
    uid: string;
    date: string;
    name: string;
    shortName: string;
    season: Reference;
    seasonType: Reference;
    timeValid: boolean;
    competitions: Competition[];
    links?: Link[];
    venues?: Reference[];
    league: Reference;
    ticketsAvailable: boolean;
    status: EventStatus;
};

export type Reference = {
    $ref: string;
};

export type Competition = {
    $ref: string;
    id: string;
    guid: string;
    uid: string;
    description: string;
    date: string;
    endDate: string;
    lastUpdated: string;
    type: CompetitionType;
    timeValid: boolean;
    neutralSite: boolean;
    previewAvailable?: boolean;
    recapAvailable?: boolean;
    boxscoreAvailable: boolean;
    lineupAvailable?: boolean;
    gamecastAvailable?: boolean;
    playByPlayAvailable?: boolean;
    conversationAvailable: boolean;
    commentaryAvailable?: boolean;
    pickcenterAvailable?: boolean;
    summaryAvailable: boolean;
    liveAvailable?: boolean;
    ticketsAvailable?: boolean;
    shotChartAvailable?: boolean;
    timeoutsAvailable?: boolean;
    possessionArrowAvailable?: boolean;
    onWatchESPN: boolean;
    recent: boolean;
    bracketAvailable?: boolean;
    gameSource: SourceInfo;
    boxscoreSource: SourceInfo;
    playByPlaySource: SourceInfo;
    linescoreSource: SourceInfo;
    statsSource: SourceInfo;
    venue: Reference;
    competitors: Competitor[];
    status: Reference;
    odds: Reference;
    broadcasts?: Reference;
    officials?: Reference;
    links?: Link[];
    format: Format;
    cardSegment?: CardSegment;
    matchNumber?: number;
};

export type CompetitionType = {
    id: string;
    text: string;
    abbreviation: string;
};

export type SourceInfo = {
    id: string;
    description: string;
    state: string;
};

export type Competitor = {
    $ref: string;
    id: string;
    uid: string;
    type: string;
    order: number;
    winner: boolean;
    athlete: Reference;
    statistics?: Reference;
    record?: Reference;
};

export type Link = {
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText?: string;
    isExternal: boolean;
    isPremium: boolean;
};

export type Format = {
    regulation: {
        periods: number;
        displayName: string;
        slug: string;
        clock: number;
    };
};

export type CardSegment = {
    id: string;
    description: string;
    name: string;
};

export type EventStatus = {
    type: StatusType;
};

export type StatusType = {
    id: string;
    name: string;
    state: string;
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
};
