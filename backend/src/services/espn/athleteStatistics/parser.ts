import * as z from 'zod';
import {Reference} from "../../parsers";

const AthleteStatisticsStat = z.object({
    name: z.string(),
    displayName: z.string(),
    shortDisplayName: z.string(),
    description: z.string(),
    abbreviation: z.string(),
    value: z.number(),
    displayValue: z.string(),
});

const AthleteStatisticsCategory = z.object({
    name: z.string(),
    displayName: z.string(),
    abbreviation: z.string(),
    summary: z.string().optional(),
    stats: z.array(AthleteStatisticsStat),
})
export const AthleteStatisticsValidator = z.object({
    $ref: z.string(),
    athlete: Reference,
    splits: z.object({
        id: z.string(),
        name: z.string(),
        abbreviation: z.string(),
        type: z.string(),
        categories: z.array(AthleteStatisticsCategory),
    })
})

export type ParsedAthleteStatistics = z.infer<typeof AthleteStatisticsValidator>;
export type ParsedAthleteStatisticsStat = z.infer<typeof AthleteStatisticsStat>;
