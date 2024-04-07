export type AthleteEventLog = {
    $ref: string;
    events: Events;
};

type Events = {
    count: number;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    items: EventItem[];
};

type EventItem = {
    event: Reference;
    competition: Reference;
    competitor: Reference;
    played: boolean;
};

type Reference = {
    $ref: string;
};
