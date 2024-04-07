import * as z from "zod";
import {Reference} from "../parsers";
import {AthleteStatisticsValidator} from "../athleteStatistics/parser";
import {AthleteRecordsItem} from "../athleteRecords/parser";
import {AthleteFullEventLogParser} from "../athleteEventLog/parser";

export const AthleteDetailValidator = z.object({
    $ref: z.string(),
    id: z.string(),
    uid: z.string(),
    guid: z.string(),
    firstName: z.string(),
    lastName: z.string().optional(),
    fullName: z.string(),
    displayName: z.string(),
    nickname: z.string().optional(),
    shortName: z.string(),
    weight: z.number(),
    displayWeight: z.string(),
    height: z.number(),
    displayHeight: z.string(),
    age: z.number(),
    dateOfBirth: z.coerce.date(),
    gender: z.string(),
    citizenship: z.string(),
    citizenshipCountry: z.object({
        alternateId: z.string().optional(),
        abbreviation: z.string().optional(),
        color: z.string().optional(),
        alternateColor: z.string().optional(),
    }).optional(),
    headshot: z.object({
        href: z.string(),
        alt: z.string().optional(),
        rel: z.array(z.string().optional()).optional(),
    }).optional(),
    flag: z.object({
        href: z.string(),
        alt: z.string().optional(),
        rel: z.array(z.string()),
    }).optional(),
    statistics: z.union([Reference, AthleteStatisticsValidator]),
    records: z.union([Reference, AthleteRecordsItem ]),
    eventLog: z.union([Reference, AthleteFullEventLogParser ]),
    images: z.array(z.object({
        href: z.string(),
        alt: z.string().optional(),
        rel: z.array(z.string().optional()).optional(),
    })),
})

export type ParsedAthleteDetail = z.infer<typeof AthleteDetailValidator>;
