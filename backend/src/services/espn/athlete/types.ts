export interface AthleteDetail {
    $ref: string;
    id: string;
    uid: string;
    guid: string;
    firstName: string;
    lastName: string;
    fullName: string;
    displayName: string;
    shortName: string;
    weight: number;
    displayWeight: string;
    height: number;
    displayHeight: string;
    age: number;
    dateOfBirth: string;
    gender: string;
    links: Link[];
    citizenship: string;
    citizenshipCountry: Country;
    slug: string;
    headshot: Image;
    flag: Flag;
    linked: boolean;
    statistics: Reference;
    records: Reference;
    active: boolean;
    eventLog: Reference;
    status: Status;
    leagues: Reference;
    defaultLeague: Reference;
    reach: number;
    displayReach: string;
    weightClass: WeightClass;
    stance: Stance;
    association: Association;
    images: Image[];
    styles?: Style[];
    ranks?: Reference;
}

interface Style {
    id: string;
    text: string;
}

interface Country {
    alternateId: string;
    abbreviation: string;
    color: string;
    alternateColor: string;
}

interface Image {
    href: string;
    alt?: string;
    rel?: string[];
}

interface Flag extends Image {
    rel: string[];
}

interface Reference {
    $ref: string;
}

interface Status {
    id: string;
    name: string;
    type: string;
    abbreviation: string;
}

interface WeightClass {
    id: string;
    text: string;
    shortName: string;
    slug: string;
}

interface Stance {
    id: string;
    text: string;
}

interface Association {
    id: string;
    name: string;
    location: Location;
}

interface Location {
    country: string;
}

type Link = {
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText?: string; // Optional based on presence in some JSON files
    isExternal: boolean;
    isPremium: boolean;
};
