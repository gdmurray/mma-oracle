import * as z from "zod";
import {Reference} from "../parsers";
import {CompetitionDetailValidator} from "../competition/parser";

export const EventDetailValidator = z.object({
    $ref: z.string(),
    id: z.string(),
    guid: z.string().optional(),
    uid: z.string().optional(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    name: z.string(),
    season: Reference.optional(),
    seasonType: Reference.optional(),
    timeValid: z.boolean(),
    competitions: z.array(CompetitionDetailValidator),
    status: z.object({
        type: z.object({
            id: z.string(),
            name: z.string(),
            state: z.string(),
            completed: z.boolean(),
            description: z.string(),
            detail: z.string(),
        })
    })
})

export type ParsedEventDetail = z.infer<typeof EventDetailValidator>;
