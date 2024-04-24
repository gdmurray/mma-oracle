import * as z from "zod";

export const LeagueValidator = z.object({
    $ref: z.string(),
    id: z.string(),
    guid: z.string().optional(),
    uid: z.string().optional(),
    name: z.string(),
    displayName: z.string(),
    abbreviation: z.string(),
    shortName: z.string(),
    slug: z.string(),
    seasons: z.object({
        $ref: z.string(),
    }).optional(),
    events: z.object({
        $ref: z.string(),
    }).optional(),
    calendar: z.object({
        $ref: z.string(),
    }).optional(),
    season: z.object({
        year: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        displayName: z.string(),
    })
})

export type ParsedLeague = z.infer<typeof LeagueValidator>;
