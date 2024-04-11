import type {ServiceContext} from "../../services/context";
import {Router} from "express";
import {CalendarService} from "../../services/calendar/service";
import {EventService} from "../../services/event/service";
import {createObjectCsvWriter as createCsvWriter} from "csv-writer";
import {AthleteService} from "../../services/athlete/service";
// import {EventOddsModel} from "../../odds/model";
import {
    americanToDecimal, getESPNOdds,
    processFightersRecords,
    weightConversions
} from "./utils";
import type {ParsedAthleteDetail} from "../../services/athlete/parser";
import {apiClient} from "../../services/apiClient/apiClient";
import type {ParsedCompetitionDetail} from "../../services/competition/parser";
// import {ParsedEventDetail} from "../../services/event/parser";
import {getEventPropOdds} from "./utils/odds";
import {EventDetailModel} from "../../services/event/model";
import {EventOddsModel} from "../../odds/model";
import {ParsedEventDetail} from "../../services/event/parser";
import {CompetitionService} from "../../services/competition/service";
import {ParsedCompetitionStatus} from "../../services/competitionStatus/parser";
import {simulateRanks} from "../../ranked/simulation";


export const modelRouter = Router();


const commonRows = [
    {id: "fighterByMethod", title: "Label"},
    {id: "fighterOneMoneyline", title: "F1 ML"},
    {id: "fighterTwoMoneyline", title: "F2 ML"},
    {id: 'fighterOneMethodWins', title: "F1 MTHD W"},
    {id: 'fighterTwoMethodLosses', title: "F2 MTHD L"},
    {id: 'fighterOneMomentum', title: "F1 Mom"},
    {id: 'fighterTwoMomentum', title: "F2 Mom"},
    {id: 'fighterOneStatOne', title: "F1 S1"},
    {id: 'fighterTwoStatOne', title: "F2 S1"},
    {id: 'fighterOneStatTwo', title: "F1 S2"},
    {id: 'fighterOneStatTwo', title: "F2 S2"},
    {id: 'fighterOneAge', title: "F1 Age"},
    {id: 'fighterTwoAge', title: "F2 Age"},
    {id: 'fighterOneHeight', title: "F1 H"},
    {id: 'fighterTwoHeight', title: "F2 H"},
    {id: 'fightWeight', title: "F Weight"},
]

const athleteServiceContext: ServiceContext = {
    services: {
        eventLog: "AthleteEventLogService",
        competition: "CompetitionService",
        status: "CompetitionStatusService",
        statistics: "AthleteStatisticsService",
        records: "AthleteRecordsService",
    }
};


modelRouter.get("/data/testing", async (_req, res) => {
    const service = new CalendarService();
    const calendarData = await service.get();
    const nextEventData = calendarData.find(event => new Date(event.startDate) > new Date());
    const eventService = new EventService(nextEventData.event.$ref);
    const nextEvent = await eventService.get();

    const csvPath = "./data/testing-data.csv";
    const csvWriter = createCsvWriter({
        path: csvPath,
        header: [
            {id: 'winnerMethod', title: "Winner and Method"},
            {id: 'fighterOne', title: "Fighter One"},
            {id: 'fighterTwo', title: "Fighter Two"},
            {id: "fighterOneRecord", title: "F1 Rec"},
            {id: "fighterTwoRecord", title: "F2 Rec"},
            ...commonRows,
        ]
    })
    const csvData = [];

    for (let event of [nextEvent]) {
        const mainCardCompetitions = event.competitions.filter((competition) => competition.cardSegment.name == "main");

        for (let competition of mainCardCompetitions) {
            const competitionService = new CompetitionService(competition.$ref, {services: {odds: "CompetitionOddsService"}});
            const competitionData = await competitionService.get();

            const competitorOne = competition.competitors.find((elem) => elem.order === 1);
            const competitorTwo = competition.competitors.find((elem) => elem.order === 2);

            const odds = getESPNOdds(competitionData);
            const fighterOneOdds = odds.homeAthleteOdds.current.decimal ?? americanToDecimal(odds.homeAthleteOdds.moneyLine.toString());
            const fighterTwoOdds = odds.awayAthleteOdds.current.decimal ?? americanToDecimal(odds.awayAthleteOdds.moneyLine.toString());

            if (!competitorOne) {
                console.error("Could not find competitor of order 1 in ", competition.competitors);
            }
            if (!competitorTwo) {
                console.error("Could not find competitor of order 2 in ", competition.competitors)
            }

            const athleteOneService = new AthleteService({athleteId: competitorOne.id}, athleteServiceContext);
            const athleteTwoService = new AthleteService({athleteId: competitorTwo.id}, athleteServiceContext);
            const athleteOneData = await athleteOneService.get();
            const athleteTwoData = await athleteTwoService.get();

            const fighterOneResults = processFightersRecords(athleteOneData);
            const fighterTwoResults = processFightersRecords(athleteTwoData);

            const {record: fighterOneRecord} = fighterOneResults;
            const {record: fighterTwoRecord} = fighterTwoResults;
            const methodKeys = {byTKO: "by KO/TKO", bySubmission: "by Submission", byDecision: "by Decision"};

            const fighters = [
                {
                    athlete: athleteOneData,
                    record: fighterOneRecord,
                    odds: fighterOneOdds
                }, {
                    athlete: athleteTwoData,
                    record: fighterTwoRecord,
                    odds: fighterTwoOdds,
                }];
            for (let index = 0; index < 2; index++) {
                const [fighterOne, fighterTwo] = index === 0 ? [fighters[0], fighters[1]] : [fighters[1], fighters[0]];
                for (const key of Object.keys(methodKeys)) {
                    const statMap = {
                        "byTKO": {
                            fighterOneMethodWins: fighterOne.record.tkoWins,
                            fighterTwoMethodLosses: fighterTwo.record.tkoLosses,
                            fighterOneStatOne: fighterOne.record.strikeAccuracy,
                            fighterTwoStatOne: fighterTwo.record.strikeAccuracy,
                            fighterOneStatTwo: fighterOne.record.strikeLPM,
                            fighterTwoStatTwo: fighterTwo.record.strikeLPM
                        },
                        "bySubmission": {
                            fighterOneMethodWins: fighterOne.record.submissionWins,
                            fighterTwoMethodLosses: fighterTwo.record.submissionLosses,
                            fighterOneStatOne: fighterOne.record.takedownAccuracy,
                            fighterTwoStatOne: fighterTwo.record.takedownAccuracy,
                            fighterOneStatTwo: fighterOne.record.submissionAttemptAverage,
                            fighterTwoStatTwo: fighterTwo.record.submissionAttemptAverage
                        },
                        "byDecision": {
                            fighterOneMethodWins: fighterOne.record.decisionWins,
                            fighterTwoMethodLosses: fighterTwo.record.decisionLosses,
                            fighterOneStatOne: fighterOne.record.strikeLPM,
                            fighterTwoStatOne: fighterTwo.record.strikeLPM,
                            fighterOneStatTwo: fighterOne.record.decisionPercentage,
                            fighterTwoStatTwo: fighterTwo.record.decisionPercentage,
                        }
                    }
                    const csvRow = {
                        winnerMethod: `${fighterOne.athlete.lastName} ${methodKeys[key as keyof typeof methodKeys]}`,
                        fighterOne: fighterOne.athlete.fullName,
                        fighterTwo: fighterTwo.athlete.fullName,
                        fighterOneRecord: fighterOne.record.record,
                        fighterTwoRecord: fighterTwo.record.record,
                        fighterByMethod: `${index === 0 ? "FighterOne" : "FighterTwo"}By${key.replace("by", "")}`,
                        fighterOneMoneyline: fighterOne.odds,
                        fighterTwoMoneyline: fighterTwo.odds,
                        ...statMap[key as keyof typeof statMap],
                        fighterOneMomentum: fighterOne.record.momentum,
                        fighterTwoMomentum: fighterTwo.record.momentum,
                        fighterOneAge: fighterOne.record.age,
                        fighterTwoAge: fighterTwo.record.age,
                        fighterOneHeight: fighterOne.record.height,
                        fighterTwoHeight: fighterTwo.record.height,
                        fightWeight: weightConversions[competition.type.abbreviation as keyof typeof weightConversions],
                    }
                    csvData.push(csvRow);
                }
            }
        }
    }

    await csvWriter.writeRecords(csvData);
    return res.status(200).json({message: `Wrote Testing Data to ${csvPath}`});
});

modelRouter.get("/data/training", async (_req, res) => {
    // const service = new CalendarService();
    // const calendarData = await service.get();
    // const eventsBeforeToday = calendarData.filter(event => new Date(event.startDate) < new Date());
    //
    // const events = await Promise.all(eventsBeforeToday.map(event => {
    //     const eventService = new EventService(event.event.$ref);
    //     return eventService.get();
    // }));

    const eventsResult = await EventDetailModel.find({
        'data.date': {
            $lt: new Date(),           // Less than today
            $gt: new Date('2023-07-01'), // Greater than July 1, 2023
        },
        'data.name': {
            $not: {
                $regex: 'Dana White\'s Contender Series|Ultimate Fighter',
                $options: 'i' // Case-insensitive matching
            }
        }
    }).lean();

    // TODO: Fix?
    // @ts-ignore
    const events = eventsResult.map(elem => elem.data) as ParsedEventDetail[];
    console.log("Found ", events.length, " Events:");
    events.forEach((elem, index) => {
        console.log("Event ", index, " - ", elem.name);
    })
    // return res.status(200).json({message: "trained"});

    const csvPath = "./data/training-data.csv";
    const csvWriter = createCsvWriter({
        path: csvPath,
        header: [
            {id: 'winnerMethod', title: "Winner and Method"},
            {id: 'fighterOne', title: "Fighter One"},
            {id: 'fighterTwo', title: "Fighter Two"},
            {id: "fighterOneRecord", title: "F1 Rec"},
            {id: "fighterTwoRecord", title: "F2 Rec"},
            ...commonRows,
            {id: "oddsDec", title: "Odds Dec"},
            {id: "odds", title: "Odds"}
        ]
    })
    const csvData = [];

    let resultSet = new Set<string>();
    let statsSet = new Set<string>();
    for (let event of events) {
        const mainCardCompetitions = event.competitions.filter((competition) => competition.cardSegment.name == "main");
        const eventOdds = await EventOddsModel.findOne({eventId: {$eq: event.id}, eventName: {$eq: event.name}});
        for (let competition of mainCardCompetitions) {
            const competitionOdds = eventOdds.competitions.find(elem => elem.competitionId === competition.id);
            if (competitionOdds == null) {
                console.log("No Odds found for this competition... Skipping...");
                continue;
            }
            const {fighterOne: fighterOneOdds, fighterTwo: fighterTwoOdds} = competitionOdds;
            const competitorOne = competition.competitors.find((elem) => elem.order === 1);
            const competitorTwo = competition.competitors.find((elem) => elem.order === 2);
            if (!competitorOne) {
                console.error("Could not find competitor of order 1 in ", competition.competitors);
            }
            if (!competitorTwo) {
                console.error("Could not find competitor of order 2 in ", competition.competitors)
            }

            const athleteOneService = new AthleteService({athleteId: competitorOne.id}, athleteServiceContext);
            const athleteTwoService = new AthleteService({athleteId: competitorTwo.id}, athleteServiceContext);
            const athleteOneData = await athleteOneService.get();
            const athleteTwoData = await athleteTwoService.get();

            const fighterOneResults = processFightersRecords(athleteOneData);
            const fighterTwoResults = processFightersRecords(athleteTwoData);
            resultSet = new Set<string>([...resultSet, ...fighterOneResults.resultSet, ...fighterTwoResults.resultSet]);
            statsSet = new Set<string>([...statsSet, ...fighterOneResults.statsSet, ...fighterTwoResults.statsSet]);

            const {record: fighterOneRecord} = fighterOneResults;
            const {record: fighterTwoRecord} = fighterTwoResults;
            const methodKeys = {byTKO: "by KO/TKO", bySubmission: "by Submission", byDecision: "by Decision"};
            // Compute Row for Fighter One

            const fighters = [
                {
                    athlete: athleteOneData,
                    record: fighterOneRecord,
                    odds: fighterOneOdds
                }, {
                    athlete: athleteTwoData,
                    record: fighterTwoRecord,
                    odds: fighterTwoOdds,
                }];
            for (let index = 0; index < 2; index++) {
                const [fighterOne, fighterTwo] = index === 0 ? [fighters[0], fighters[1]] : [fighters[1], fighters[0]];
                for (const key of Object.keys(methodKeys)) {
                    const statMap = {
                        "byTKO": {
                            fighterOneMethodWins: fighterOne.record.tkoWins,
                            fighterTwoMethodLosses: fighterTwo.record.tkoLosses,
                            fighterOneStatOne: fighterOne.record.strikeAccuracy,
                            fighterTwoStatOne: fighterTwo.record.strikeAccuracy,
                            fighterOneStatTwo: fighterOne.record.strikeLPM,
                            fighterTwoStatTwo: fighterTwo.record.strikeLPM
                        },
                        "bySubmission": {
                            fighterOneMethodWins: fighterOne.record.submissionWins,
                            fighterTwoMethodLosses: fighterTwo.record.submissionLosses,
                            fighterOneStatOne: fighterOne.record.takedownAccuracy,
                            fighterTwoStatOne: fighterTwo.record.takedownAccuracy,
                            fighterOneStatTwo: fighterOne.record.submissionAttemptAverage,
                            fighterTwoStatTwo: fighterTwo.record.submissionAttemptAverage
                        },
                        "byDecision": {
                            fighterOneMethodWins: fighterOne.record.decisionWins,
                            fighterTwoMethodLosses: fighterTwo.record.decisionLosses,
                            fighterOneStatOne: fighterOne.record.strikeLPM,
                            fighterTwoStatOne: fighterTwo.record.strikeLPM,
                            fighterOneStatTwo: fighterOne.record.decisionPercentage,
                            fighterTwoStatTwo: fighterTwo.record.decisionPercentage,
                        }
                    }
                    const csvRow = {
                        winnerMethod: `${fighterOne.athlete.lastName} ${methodKeys[key as keyof typeof methodKeys]}`,
                        fighterOne: fighterOne.athlete.fullName,
                        fighterTwo: fighterTwo.athlete.fullName,
                        fighterOneRecord: fighterOne.record.record,
                        fighterTwoRecord: fighterTwo.record.record,
                        fighterByMethod: `${index === 0 ? "FighterOne" : "FighterTwo"}By${key.replace("by", "")}`,
                        fighterOneMoneyline: fighterOne.odds.moneyLine,
                        fighterTwoMoneyline: fighterTwo.odds.moneyLine,
                        ...statMap[key as keyof typeof statMap],
                        fighterOneMomentum: fighterOne.record.momentum,
                        fighterTwoMomentum: fighterTwo.record.momentum,
                        fighterOneAge: fighterOne.record.age,
                        fighterTwoAge: fighterTwo.record.age,
                        fighterOneHeight: fighterOne.record.height,
                        fighterTwoHeight: fighterTwo.record.height,
                        fightWeight: weightConversions[competition.type.abbreviation as keyof typeof weightConversions],
                        oddsDec: americanToDecimal(fighterOne.odds[key as keyof typeof methodKeys]),
                        odds: fighterOne.odds[key as keyof typeof methodKeys],
                    }
                    csvData.push(csvRow);
                }
            }
        }
    }


    console.log("RESULT SET: ", resultSet);
    console.log("STATS SET: ", statsSet);

    await csvWriter.writeRecords(csvData);
    return res.status(200).json({message: `Wrote Training data to ${csvPath}`});
})

modelRouter.get("/events/:eventId/odds/scrape", async (req, res) => {
    const {eventId} = req.params;
    console.log("Scraping for eventID:", eventId);
    const eventService = new EventService({eventId: eventId}, {
        services: {athlete: "AthleteService"}
    })
    const event = await eventService.get();

    const mainCardCompetitions = event.competitions.filter((competition) => competition.cardSegment.name === "main");
    await getEventPropOdds(event, mainCardCompetitions);
    return res.status(200).json({message: "scraped"});
})
modelRouter.get("/seasons/scrape", async (req, res) => {
    const queryString = "?" + req.url.split("?").pop()
    const response = await apiClient.fetch(`https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events${queryString}`);
    const eventsList = await response.json();
    const {items} = eventsList as { items: { $ref: string }[] };
    const filteredEvents = (await Promise.all(items.map(elem => {
        const eventsService = new EventService(elem.$ref);
        return eventsService.get()
    }))).filter(event => !event.name.includes("Dana White's Contender Series") && !event.name.includes("Ultimate Fighter"));

    console.log("Events List: ", filteredEvents.length, " Events");
    filteredEvents.forEach((elem, index) => {
        console.log(`Event ${index} - ${elem.name}`)
    })
    console.log("");
    // return res.status(200).json({message: "scraping"});

    for (const event of [filteredEvents[21]]) {
        const eventService = new EventService(event.$ref, {services: {athlete: "AthleteService"}});
        const eventsData = await eventService.get();

        const mainCardCompetitions = eventsData.competitions.filter((competition) => competition.cardSegment.name === "main");
        await getEventPropOdds(event, mainCardCompetitions);
        console.log(eventsData.name);
        mainCardCompetitions.forEach((competition) => {
            const competitorOne = competition.competitors.find((elem) => elem.order === 1) as ParsedCompetitionDetail & {
                athlete: ParsedAthleteDetail
            };
            const competitorTwo = competition.competitors.find((elem) => elem.order === 2) as ParsedCompetitionDetail & {
                athlete: ParsedAthleteDetail
            };
            console.log(competitorOne.athlete.fullName, " vs ", competitorTwo.athlete.fullName);
        })
        console.log("-------------------")
    }
    return res.status(200).json({message: "scraping"});
})
modelRouter.get("/odds/scrape", async (_req, res) => {

    // const service = new CalendarService();
    // const calendarData = await service.get();
    // const eventsBeforeToday = calendarData.filter(event => new Date(event.startDate) < new Date());
    // const eventsData = await Promise.all(eventsBeforeToday.map(event => {
    //     const eventService = new EventService(event.event.$ref);
    //     return eventService.get();
    // }));

    // for (let event of eventsData) {
    //     const mainCardCompetitions = event.competitions.filter((competition) => competition.cardSegment.name == "main");
    // const eventOdds = await getEventPropOdds(event, mainCardCompetitions);
    // for (let competition of mainCardCompetitions) {
    //     const competitionService = new CompetitionService(competition.$ref, {
    //         athlete: ["AthleteService", {parent: "competitors"}],
    //         records: "AthleteRecordsService",
    //         status: "CompetitionStatusService",
    //         statistics: ["AthleteStatisticsService", {parent: "athlete"}],
    //     });
    //     const competitionData = await competitionService.get();
    //     const fighterOne = competitionData.competitors.find(elem => elem.order === 1);
    //     const fighterTwo = competitionData.competitors.find(elem => elem.order === 2);
    //     if (fighterOne.athlete == null || fighterTwo.athlete == null) {
    //         console.log("UNDEFINED FIGHTERS?: ", fighterOne, fighterTwo);
    //         continue;
    //     }
    //     const fighterOneFullName = getFullName(fighterOne.athlete as ParsedAthleteDetail);
    //     const fighterTwoFullName = getFullName(fighterTwo.athlete as ParsedAthleteDetail);
    //
    //     console.log("ODDS FOR FIGHT: ", fighterOneFullName, fighterTwoFullName);
    //
    //     const oddsExist = eventOdds.competitions.find(elem => elem.competitionId === competition.id);
    //     if (oddsExist) {
    //         console.log("ODDS ALREADY FETCHED FOR THIS FIGHT")
    //         continue;
    //     }
    //
    // }
    // await EventOddsModel.updateOne({eventId: {$eq: event.id}}, {competitions: competitionOdds});
    // console.log("-----------------------------------")
    // }
    return res.status(200).json({message: "Scraped"})
})

// type Outcome = {
//     method: "Decision" | "TKO" | "Submission",
//     round: number | null,
// }
modelRouter.get("/outcomes", async (req, res) => {
    const queryString = "?" + req.url.split("?").pop()
    const response = await apiClient.fetch(`https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events${queryString}`);
    const eventsList = await response.json();
    const {items} = eventsList as { items: { $ref: string }[] };
    const filteredEvents = (await Promise.all(items.map(elem => {
        const eventsService = new EventService(elem.$ref, {
            services: {
                athlete: "AthleteService",
                status: "CompetitionStatusService"
            }
        });
        return eventsService.get()
    })))

    // console.log(rows);
    // console.log(filteredEvents.length);
    const outcomes = {
        "Decision": 0,
        "Submission": {
            1: 0,
            2: 0,
            3: 0
        },
        "TKO": {
            1: 0,
            2: 0,
            3: 0,
        }
    };
    let totalEvents = 0;
    for (const event of filteredEvents) {
        for (const competition of event.competitions) {
            // const competitorOne = competition.competitors.find((elem) => elem.order === 1) as ParsedCompetitionDetail & {
            //     athlete: ParsedAthleteDetail
            // };
            // const competitorTwo = competition.competitors.find((elem) => elem.order === 2) as ParsedCompetitionDetail & {
            //     athlete: ParsedAthleteDetail
            // };
            // const competitorOneOutcomes = rows.filter(row => row["Fighter One"] === competitorOne.athlete.fullName);
            // const competitorTwoOutcomes = rows.filter(row => row["Fighter Two"] === competitorTwo.athlete.fullName);
            const {status} = competition as { status: ParsedCompetitionStatus };
            const isSubmission = status.result.name.includes("submission");
            const isDecision = status.result.name.includes("decision");
            const isTKO = ["ko", "tko", "kotko"].includes(status.result.name)
                || status.result.name.endsWith("-stoppage")
                || status.result.name.startsWith("ko");
            // const isNoContest = status.result.name === "no-contest";

            if (isSubmission) {
                let round = Math.min(status.period, 3);
                // @ts-ignore
                outcomes.Submission[round]++;
                totalEvents++;
            }
            if (isTKO) {
                let round = Math.min(status.period, 3);
                // @ts-ignore
                outcomes.TKO[round]++;
                totalEvents++;
            }
            if (isDecision) {
                outcomes.Decision++;
                totalEvents++;
            }
        }
    }
    const frequencies = [
        {outcome: "Decision", round: null, frequency: outcomes.Decision / totalEvents},
        {outcome: "Submission", round: 1, frequency: outcomes.Submission[1] / totalEvents},
        {outcome: "Submission", round: 2, frequency: outcomes.Submission[2] / totalEvents},
        {outcome: "Submission", round: 3, frequency: outcomes.Submission[3] / totalEvents},
        {outcome: "TKO", round: 1, frequency: outcomes.TKO[1] / totalEvents},
        {outcome: "TKO", round: 2, frequency: outcomes.TKO[2] / totalEvents},
        {outcome: "TKO", round: 3, frequency: outcomes.TKO[3] / totalEvents},
    ]
    console.log(outcomes, totalEvents);
    console.log("Frequencies: ", frequencies);
    return res.status(200).end();
})

modelRouter.get("/simulate", async (_req, res) => {
    await simulateRanks();
    return res.status(200).end();
})

export default modelRouter;
