import * as z from "zod";

export const AthleteRecordsItem = z.object({
    $ref: z.string(),
    id: z.string(),
    type: z.string(),
    summary: z.string(),
    displayValue: z.string(),
    stats: z.array(z.object({
        name: z.string(),
        displayName: z.string(),
        abbreviation: z.string(),
        type: z.string(),
        value: z.number(),
        displayValue: z.string(),
    })),
})
export const AthleteRecordsPaginatedSchema = z.object({
    count: z.number(),
    pageIndex: z.number(),
    pageSize: z.number(),
    pageCount: z.number(),
    items: z.array(AthleteRecordsItem),
})

export const AthleteRecordsValidator = z.union([AthleteRecordsItem, AthleteRecordsPaginatedSchema])

export type ParsedAthleteRecordItem = z.infer<typeof AthleteRecordsItem>;
export type ParsedAthleteRecordsData = z.infer<typeof AthleteRecordsValidator>;
