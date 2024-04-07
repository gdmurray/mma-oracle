export type CompetitionDetail = {
    $ref: string;
    id: string;
    guid: string;
    uid: string;
    description: string;
    date: string;
    endDate: string;
    lastUpdated: string;
    type: {
        id: string;
        text: string;
        abbreviation: string;
    };
    timeValid: boolean;
    neutralSite: boolean;
    previewAvailable: boolean;
    recapAvailable: boolean;
    boxscoreAvailable: boolean;
    lineupAvailable: boolean;
    gamecastAvailable: boolean;
    playByPlayAvailable: boolean;
    conversationAvailable: boolean;
    commentaryAvailable?: boolean; // Optional based on presence in some JSON files
    pickcenterAvailable: boolean;
    summaryAvailable: boolean;
    liveAvailable: boolean;
    ticketsAvailable: boolean;
    shotChartAvailable: boolean;
    timeoutsAvailable: boolean;
    possessionArrowAvailable: boolean;
    onWatchESPN: boolean;
    recent: boolean;
    bracketAvailable: boolean;
    gameSource: {
        id: string;
        description: string;
        state: string;
    };
    boxscoreSource: {
        id: string;
        description: string;
        state: string;
    };
    playByPlaySource: {
        id: string;
        description: string;
        state: string;
    };
    linescoreSource: {
        id: string;
        description: string;
        state: string;
    };
    statsSource: {
        id: string;
        description: string;
        state: string;
    };
    venue: {
        $ref: string;
        id: string;
        fullName: string;
        address: {
            city: string;
            state: string;
            grass?: boolean; // Optional based on presence in some JSON files
            indoor: boolean;
        };
    };
    competitors: Competitor[];
    status: {
        $ref: string;
    };
    odds?: {
        $ref: string;
    }; // Optional based on presence in some JSON files
    broadcasts?: {
        $ref: string;
    }; // Optional based on presence in some JSON files
    officials?: {
        $ref: string;
    }; // Optional based on presence in some JSON files
    links: Link[];
    format: {
        regulation: {
            periods: number;
            displayName: string;
            slug: string;
            clock: number;
        };
    };
    cardSegment: {
        id: string;
        description: string;
        name: string;
    };
    matchNumber: number;
};

type Competitor = {
    $ref: string;
    id: string;
    uid: string;
    type: string;
    order: number;
    winner: boolean;
    athlete: {
        $ref: string;
    };
    linescores?: {
        $ref: string;
    }; // Optional based on presence in some JSON files
    statistics?: {
        $ref: string;
    }; // Optional based on presence in some JSON files
    record?: {
        $ref: string;
    }; // Optional based on presence in some JSON files
};

type Link = {
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText?: string; // Optional based on presence in some JSON files
    isExternal: boolean;
    isPremium: boolean;
};
