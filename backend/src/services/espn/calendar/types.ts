export interface ScoreboardResponse {
    leagues: League[];
    season: Season;
    day: {
        date: string;
    };
    events: Event[];
}

export interface EventStatus {
    type: StatusType;
}

export interface StatusType {
    id: string;
    name: string;
    state: string;
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
}

export interface Link {
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText?: string;
    isExternal: boolean;
    isPremium: boolean;
}

export interface Logo {
    href: string;
    width: number;
    height: number;
    alt: string;
    rel: string[];
    lastUpdated: string;
}

export interface SeasonType {
    id: string;
    type: number;
    name: string;
    abbreviation: string;
}

export interface Season {
    year: number;
    startDate: string;
    endDate: string;
    displayName: string;
    type: SeasonType;
}

export interface League {
    id: string;
    uid: string;
    name: string;
    abbreviation: string;
    slug: string;
    season: Season;
    logos: Logo[];
    calendarType: string;
    calendarIsWhitelist: boolean;
    calendarStartDate: string;
    calendarEndDate: string;
    calendar: CalendarEvent[];
    links?: Link[];
    venues?: Venue[];
}

export interface CalendarEvent {
    label: string;
    startDate: string;
    endDate: string;
    event: EventRef;
}

export interface EventRef {
    $ref: string;
}

export interface Venue {
    id: string;
    fullName: string;
    address: Address;
}

export interface Address {
    city: string;
    state: string;
    country: string;
}

export interface Event {
    id: string;
    uid: string;
    date: string;
    name: string;
    shortName: string;
    season: Season;
    competitions: Competition[];
}

export interface Competition {
    id: string;
    uid: string;
    date: string;
    endDate: string;
    type: CompetitionType;
    timeValid: boolean;
    neutralSite: boolean;
    playByPlayAvailable: boolean;
    recent: boolean;
    venue: Venue;
    competitors: Competitor[];
    status: EventStatus;
    broadcasts: Broadcast[];
    format: Format;
    startDate: string;
    geoBroadcasts: GeoBroadcast[];
}

export interface CompetitionType {
    id: string;
    abbreviation: string;
}

export interface Competitor {
    id: string;
    uid: string;
    type: string;
    order: number;
    winner: boolean;
    athlete: Athlete;
    records: Record[];
}

export interface Athlete {
    fullName: string;
    displayName: string;
    shortName: string;
    flag: Flag;
}

export interface Flag {
    href: string;
    alt: string;
    rel: string[];
}

interface Record {
    name: string;
    abbreviation: string;
    type: string;
    summary: string;
}

interface Broadcast {
    market: string;
    names: string[];
}

interface Format {
    regulation: Regulation;
}

interface Regulation {
    periods: number;
}

interface GeoBroadcast {
    type: BroadcastType;
    market: Market;
    media: Media;
    lang: string;
    region: string;
}

interface BroadcastType {
    id: string;
    shortName: string;
}

interface Market {
    id: string;
    type: string;
}

interface Media {
    shortName: string;
}
