import * as z from "zod";

const CompetitionResult = z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    displayName: z.string().optional(),
    description: z.string().optional(),
    displayDescription: z.string().optional(),
    shortDisplayName: z.string().optional(),
    target: z.object({
        id: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        displayDescription: z.string().optional(),
    }).optional(),
})

export const CompetitionStatusValidator = z.object({
    $ref: z.string(),
    clock: z.number().optional(),
    displayClock: z.string().optional(),
    period: z.number().optional(),
    type: z.object({
        id: z.string(),
        name: z.string(),
        state: z.string(),
        completed: z.boolean(),
        description: z.string(),
        detail: z.string(),
        shortDetail: z.string(),
    }),
    result: CompetitionResult.optional(),
})

export type ParsedCompetitionStatus = z.infer<typeof CompetitionStatusValidator>;
