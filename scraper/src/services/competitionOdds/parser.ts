import * as z from "zod";


const OddsLine = z.object({
    value: z.number().optional(),
    displayValue: z.string().optional(),
    alternateDisplayValue: z.string().optional(),
    decimal: z.number().optional(),
    fraction: z.string().optional(),
    american: z.string().optional(),
})
export const AthleteOdds = z.object({
    favorite: z.boolean().optional(),
    underdog: z.boolean().optional(),
    moneyLine: z.number().optional(),
    open: OddsLine.optional(),
    close: OddsLine.optional(),
    current: OddsLine.optional(),
})
export const CompetitionOdds = z.object({
    $ref: z.string(),
    provider: z.object({
        $ref: z.string(),
        id: z.string(),
        name: z.string(),
        priority: z.number(),
    }),
    details: z.string().optional(),
    overUnder: z.number().optional(),
    awayAthleteOdds: AthleteOdds.optional(),
    homeAthleteOdds: AthleteOdds.optional(),
})

export const PaginatedCompetitionOdds = z.object({
    count: z.number(),
    pageIndex: z.number(),
    pageSize: z.number(),
    pageCount: z.number(),
    items: z.array(CompetitionOdds),
})

export const CompetitionOddsDataValidator = z.object({
    competitionId: z.string(),
    items: z.array(CompetitionOdds),
})

export type ParsedPaginatedCompetitionOdds = z.infer<typeof PaginatedCompetitionOdds>
export type ParsedCompetitionOddsData = z.infer<typeof CompetitionOddsDataValidator>
