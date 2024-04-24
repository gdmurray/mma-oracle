import * as z from 'zod';

// const Address = z.object({
//     city: z.string(),
//     state: z.string(),
//     country: z.string(),
// });
//
// const Flag = z.object({
//     href: z.string(),
//     alt: z.string(),
//     rel: z.array(z.string()),
// });
//
// const Athlete = z.object({
//     fullName: z.string(),
//     displayName: z.string(),
//     shortName: z.string(),
//     flag: Flag,
// });
//
// const Record = z.object({
//     name: z.string(),
//     abbreviation: z.string(),
//     type: z.string(),
//     summary: z.string(),
// });
//
// const BroadcastType = z.object({
//     id: z.string(),
//     shortName: z.string(),
// });
//
// const Market = z.object({
//     id: z.string(),
//     type: z.string(),
// });
//
// const Media = z.object({
//     shortName: z.string(),
// });
//
// const GeoBroadcast = z.object({
//     type: BroadcastType,
//     market: Market,
//     media: Media,
//     lang: z.string(),
//     region: z.string(),
// });
//
// const Format = z.object({
//     regulation: z.object({
//         periods: z.number(),
//     }),
// });
//
// const Broadcast = z.object({
//     market: z.string(),
//     names: z.array(z.string()),
// });
//
// const CompetitionType = z.object({
//     id: z.string(),
//     abbreviation: z.string(),
// });
//
// const Competitor = z.object({
//     id: z.string(),
//     uid: z.string(),
//     type: z.string(),
//     order: z.number(),
//     winner: z.boolean(),
//     athlete: Athlete,
//     records: z.array(Record),
// });
//
// const EventStatus = z.object({
//     type: z.object({
//         id: z.string(),
//         name: z.string(),
//         state: z.string(),
//         completed: z.boolean(),
//         description: z.string(),
//         detail: z.string(),
//         shortDetail: z.string(),
//     }),
// });
//
// const Venue = z.object({
//     id: z.string(),
//     fullName: z.string(),
//     address: Address,
// });

const EventRef = z.object({
    $ref: z.string().transform((v) => v.replace('.pvt', '.com'))
});

const CalendarEvent = z.object({
    label: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    event: EventRef,
});

// const SeasonType = z.object({
//     id: z.string(),
//     type: z.number(),
//     name: z.string(),
//     abbreviation: z.string(),
// });
//
// const Season = z.object({
//     year: z.number(),
//     startDate: z.string(),
//     endDate: z.string(),
//     displayName: z.string(),
//     type: SeasonType,
// });

// const Logo = z.object({
//     href: z.string(),
//     width: z.number(),
//     height: z.number(),
//     alt: z.string(),
//     rel: z.array(z.string()),
//     lastUpdated: z.string(),
// });
//
// const Link = z.object({
//     language: z.string(),
//     rel: z.array(z.string()),
//     href: z.string(),
//     text: z.string(),
//     shortText: z.string().optional(),
//     isExternal: z.boolean(),
//     isPremium: z.boolean(),
// });

const CalendarArray = z.array(CalendarEvent);

const League = z.object({
    id: z.string(),
    uid: z.string(),
    name: z.string(),
    abbreviation: z.string(),
    slug: z.string(),
    // season: Season,
    // logos: z.array(Logo),
    // calendarType: z.string(),
    // calendarIsWhitelist: z.boolean(),
    calendarStartDate: z.coerce.date(),
    calendarEndDate: z.coerce.date(),
    calendar: CalendarArray,
    // links: z.array(Link).optional(),
    // venues: z.array(Venue).optional(),
    // status: EventStatus,
});


// const Competition = z.object({
//     id: z.string(),
//     uid: z.string(),
//     date: z.string(),
//     endDate: z.string(),
//     type: CompetitionType,
//     timeValid: z.boolean(),
//     neutralSite: z.boolean(),
//     playByPlayAvailable: z.boolean(),
//     recent: z.boolean(),
//     venue: Venue,
//     competitors: z.array(Competitor),
//     status: EventStatus,
//     broadcasts: z.array(Broadcast),
//     format: Format,
//     startDate: z.string(),
//     geoBroadcasts: z.array(GeoBroadcast),
// });

// const Event = z.object({
//     id: z.string(),
//     uid: z.string(),
//     date: z.string(),
//     name: z.string(),
//     shortName: z.string(),
//     season: Season,
//     competitions: z.array(Competition),
// });

export const ScoreboardResponseValidator = z.object({
    leagues: z.array(League),
    // season: Season,
    // day: z.object({
    //     date: z.string(),
    // }),
    // events: z.array(Event),
});

export type ParsedScoreboardResponse = z.infer<typeof ScoreboardResponseValidator>;
export type ParsedCalendarList = z.infer<typeof CalendarArray>
