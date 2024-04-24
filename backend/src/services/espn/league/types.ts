export interface League {
    id: string;
    guid: string;
    uid: string;
    name: string;
    displayName: string;
    abbreviation: string;
    shortName: string;
    slug: string;
    seasons: Ref;
    events: Ref;
    links: Link[];
    logos: Logo[];
    calendar: Ref;
    gender: string;
    season: Season;
}

interface Season {
    year: number;
    startDate: string;
    endDate: string;
    displayName: string;
    type: SeasonType;
    types: SeasonTypes;
}

interface SeasonType {
    id: string;
    type: number;
    name: string;
    abbreviation: string;
    year: number;
    startDate: string;
    endDate: string;
    hasGroups: boolean;
    hasStandings: boolean;
    hasLegs: boolean;
    slug: string;
}

interface SeasonTypes {
    count: number;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    items: SeasonType[];
}

interface Ref {
    $ref: string;
}

interface Link {
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText: string;
    isExternal: boolean;
    isPremium: boolean;
}

interface Logo {
    href: string;
    width: number;
    height: number;
    alt: string;
    rel: string[];
    lastUpdated: string;
}
