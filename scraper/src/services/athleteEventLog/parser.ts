import * as z from "zod";
import {Reference} from "../parsers";
import {CompetitionDetailValidator} from "../competition/parser";

export const AthleteEvent = z.object({
    event: Reference,
    competition: z.union([Reference, CompetitionDetailValidator]),
    played: z.boolean(),
})
export const AthleteFullEventLogParser = z.object({
    $ref: z.string(),
    athleteId: z.string(),
    events: z.array(AthleteEvent)
});
export const AthletePaginatedEventLogParser = z.object({
    $ref: z.string(),
    events: z.object({
        count: z.number(),
        pageIndex: z.number(),
        pageSize: z.number(),
        pageCount: z.number(),
        items: z.array(AthleteEvent),
    })
})

export type ParsedAthleteFullEventLog = z.infer<typeof AthleteFullEventLogParser>
export type ParsedAthletePaginatedEventLog = z.infer<typeof AthletePaginatedEventLogParser>;
