import * as z from "zod";
import {Reference} from "../../parsers";
import {CompetitionStatusValidator} from "../competitionStatus/parser";
import {ZodObject} from "zod";

let athleteDetailSchema: ZodObject<any> = null;
const getAthleteDetailSchema = () => {
    if (athleteDetailSchema == null) {
        const {AthleteDetailValidator} = require("../athlete/parser");
        athleteDetailSchema = AthleteDetailValidator;
    }
    return athleteDetailSchema;
}

const CompetitionType = z.object({
    id: z.string(),
    text: z.string(),
    abbreviation: z.string(),
})

const Competitor = z.object({
    $ref: z.string(),
    id: z.string(),
    uid: z.string(),
    order: z.number(),
    winner: z.boolean(),
    athlete: z.union([Reference, z.lazy(() => getAthleteDetailSchema())])
})

export const CompetitionDetailValidator = z.object({
    $ref: z.string(),
    id: z.string(),
    guid: z.string().optional(),
    uid: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date(),
    lastUpdated: z.coerce.date().optional(),
    type: CompetitionType.optional(),
    competitors: z.array(Competitor),
    odds: z.object({
        $ref: z.string(),
    }).optional(),
    status: z.union([Reference, CompetitionStatusValidator]),
    format: z.object({
        regulation: z.object({
            periods: z.number(),
            displayName: z.string(),
            slug: z.string(),
            clock: z.number(),
        }),
    }),
    cardSegment: z.object({
        id: z.string(),
        description: z.string(),
        name: z.string(),
    }).optional(),
    matchNumber: z.number(),
})

export type ParsedCompetitionDetail = z.infer<typeof CompetitionDetailValidator>;
export type ParsedCompetitorDetail = z.infer<typeof Competitor>;

