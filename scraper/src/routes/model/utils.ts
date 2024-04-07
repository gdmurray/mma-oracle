import type {ParsedAthleteDetail} from "../../services/athlete/parser";
import type {ParsedAthleteRecordItem} from "../../services/athleteRecords/parser";
import type {ParsedAthleteStatistics, ParsedAthleteStatisticsStat} from "../../services/athleteStatistics/parser";
import type {ParsedAthleteFullEventLog} from "../../services/athleteEventLog/parser";
import type {ParsedCompetitionDetail} from "../../services/competition/parser";
import type {ParsedCompetitionStatus} from "../../services/competitionStatus/parser";
import type {ParsedCompetitionOddsData} from "../../services/competitionOdds/parser";

const puppeteer = require("puppeteer");

export function getESPNOdds(competition: ParsedCompetitionDetail) {
    const {odds} = competition as { odds: ParsedCompetitionOddsData }
    const draftKingsOdds = odds.items.find(elem => elem.provider.name === "DraftKings");
    const espnBetOdds = odds.items.find(elem => elem.provider.name === "ESPN BET");
    const bet365Odds = odds.items.find(elem => elem.provider.name === "Bet365");
    return draftKingsOdds ?? bet365Odds ?? espnBetOdds;
}

export type FighterRecords = {
    wins: number;
    losses: number;
    decisionWins: number;
    decisionLosses: number;
    tkoWins: number;
    tkoLosses: number;
    submissionWins: number;
    submissionLosses: number;
}

export enum Outcomes {
    KOTKO = "KOTKO",
    SUBMISSION = "Submission",
    DECISION = "Decision",
    LOSS = "Loss",
}

export function normalizeValue(value: number, maxExpectedValue: number): number {
    return value / maxExpectedValue;
}

export const weightConversions = {
    "W Strawweight": 115,
    "W Flyweight": 125,
    "W Bantamweight": 135,
    "Flyweight": 125,
    "Bantamweight": 135,
    "Featherweight": 145,
    "Lightweight": 155,
    "Welterweight": 170,
    "Middleweight": 185,
    "Light Heavyweight": 205,
    "Heavyweight": 265,
}

export function processFightersRecords(athlete: ParsedAthleteDetail) {
    const maxSubmissionAverage = 7.38;
    const maxStrikeLPM = 8.41;
    const maxAccuracy = 100;
    const resultSet = new Set<string>();
    const statsSet = new Set<string>();
    const {records, statistics} = athlete as { records: ParsedAthleteRecordItem; statistics: ParsedAthleteStatistics };
    const fighterStats: ParsedAthleteStatisticsStat[] = [];
    statistics.splits.categories.forEach((elem) => {
        elem.stats.forEach((stat) => {
            fighterStats.push(stat);
            statsSet.add(stat.name);
        })
    });
    const {stats} = records;
    const fighterRecord: FighterRecords = {
        wins: stats.find(elem => elem.type === "wins").value,
        losses: stats.find(elem => elem.type === "losses").value,
        decisionWins: 0,
        decisionLosses: 0,
        tkoWins: 0,
        tkoLosses: 0,
        submissionWins: stats.find(elem => elem.type === "submissions").value,
        submissionLosses: stats.find(elem => elem.type === "submissionlosses").value,
    }

    const record: FighterRecords = {
        wins: 0,
        losses: 0,
        decisionWins: 0,
        decisionLosses: 0,
        tkoWins: 0,
        tkoLosses: 0,
        submissionWins: 0,
        submissionLosses: 0,
    }
    const points = {
        [Outcomes.KOTKO]: 1.5,
        [Outcomes.SUBMISSION]: 1.2,
        [Outcomes.DECISION]: 1,
        [Outcomes.LOSS]: 0
    };
    const weights = [1, 0.8, 0.6, 0.4, 0.2];
    const recentFights = []
    const playedEvents = (athlete.eventLog as ParsedAthleteFullEventLog).events.filter(event => event.played);
    for (const event of playedEvents) {
        const {competition} = event as { competition: ParsedCompetitionDetail };
        const isWinner = competition.competitors.some((elem) => elem.id === athlete.id && elem.winner === true);
        const {status} = competition as { status: ParsedCompetitionStatus };
        resultSet.add(status.result.name);
        const isSubmission = status.result.name.includes("submission");
        const isDecision = status.result.name.includes("decision");
        const isTKO = ["ko", "tko", "kotko"].includes(status.result.name)
            || status.result.name.endsWith("-stoppage")
            || status.result.name.startsWith("ko");
        const isNoContest = status.result.name === "no-contest";
        const isDraw = status.result.name.includes("draw");
        // const isDq = status.result.name.startsWith("dq");
        if (!isDraw && !isNoContest) {
            if (isWinner) {
                record.wins++;

                if (isSubmission) {
                    if (recentFights.length < 5) {
                        recentFights.push(Outcomes.SUBMISSION);
                    }
                    record.submissionWins++;
                }
                if (isDecision) {
                    if (recentFights.length < 5) {
                        recentFights.push(Outcomes.DECISION);
                    }
                    record.decisionWins++;
                }
                if (isTKO) {
                    if (recentFights.length < 5) {
                        recentFights.push(Outcomes.KOTKO);
                    }
                    record.tkoWins++
                }
            } else {
                record.losses++;

                if (recentFights.length < 5) {
                    recentFights.push(Outcomes.LOSS);
                }

                if (isSubmission) {
                    record.submissionLosses++;
                }
                if (isDecision) {
                    record.decisionLosses++;
                }
                if (isTKO) {
                    record.tkoLosses++;
                }
            }
        }
    }

    console.log("Athlete: ", athlete.fullName);
    // console.log("Athlete Stats Count: ", statsSet.size);
    // console.log("RECENT 5 FIGHTS: ", recentFights);
    // console.log("Athlete Stats: ", Array.from(statsSet.values()).join(", "))
    // console.log("Scraped Fighter Record: ", record);
    const momentumScore = recentFights.reduce((acc, fight, index) => {
        // Use the points for the outcome, or default to 0 if not found
        const fightPoints = points[fight as keyof typeof points] || 0;
        // Use the corresponding weight, or default to the smallest weight if index is out of bounds
        const weight = weights[index] || weights[weights.length - 1];
        return acc + (fightPoints * weight);
    }, 0) / weights.slice(0, recentFights.length).reduce((acc, weight) => acc + weight, 0);
    const maxScore = points[Outcomes.KOTKO];
    const normalizedMomentum = momentumScore / (maxScore * recentFights.length);
    if (fighterRecord.wins !== record.wins || fighterRecord.losses !== record.losses) {
        console.log("Scraped Record doesn't match the actual record: ", fighterRecord, record)
    }
    const takedownAccuracy = fighterStats.find((elem) => elem.name === "takedownAccuracy") ?? {value: 25};
    const submissionAttemptAverage = fighterStats.find((elem) => elem.name === "submissionAvg") ?? {value: 0.5};
    const strikeAccuracy = fighterStats.find((elem) => elem.name === "strikeAccuracy") ?? {value: 50};
    const strikeLPM = fighterStats.find((elem) => elem.name === "strikeLPM") ?? {value: 2};
    const decisionPercentage = fighterStats.find((elem) => elem.name === "decisionPercentage") ?? {value: 0};
    const computedRecord = {
        record: records.displayValue,
        decisionWins: record.wins != 0 ? record.decisionWins / record.wins : 0,
        decisionLosses: record.losses != 0 ? record.decisionLosses / record.losses : 0,
        tkoWins: record.wins != 0 ? record.tkoWins / record.wins : 0,
        tkoLosses: record.losses != 0 ? record.tkoLosses / record.losses : 0,
        submissionWins: record.wins != 0 ? record.submissionWins / record.wins : 0,
        submissionLosses: record.losses != 0 ? record.submissionLosses / record.losses : 0,
        momentum: normalizedMomentum,
        takedownAccuracy: normalizeValue(takedownAccuracy.value, maxAccuracy),
        submissionAttemptAverage: normalizeValue(submissionAttemptAverage.value, maxSubmissionAverage),
        strikeAccuracy: normalizeValue(strikeAccuracy.value, maxAccuracy),
        strikeLPM: normalizeValue(strikeLPM.value, maxStrikeLPM),
        decisionPercentage: normalizeValue(decisionPercentage.value, maxAccuracy),
        age: athlete.age ?? 30,
        height: athlete.height,
    }
    console.log("-------------------");
    return {record: computedRecord, resultSet, statsSet}
}

export function americanToDecimal(oddsString: string): number | string {
    const odds = parseInt(oddsString)
    if (isNaN(odds)) {
        console.error("Error Parsing: ", odds, oddsString);
        return oddsString
    }

    // Conversion logic
    if (odds > 0) {
        return (odds / 100) + 1;
    } else {
        return (100 / Math.abs(odds)) + 1;
    }
}

export async function launchBrowserAndFetchHTML(url: string) {
    const browser = await puppeteer.launch({
        headless: false, // Running in headless mode can sometimes increase the likelihood of being detected
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    const page = await browser.newPage();

    // Set a user agent to mimic a real user's browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

    page.setDefaultNavigationTimeout(60000);

    // Navigate to the webpage
    await page.goto(url, {
        waitUntil: 'networkidle2', // Waits until the network is idle (no more than 2 connections for at least 500 ms)
    });

    const htmlContent = await page.content();
    // Close the browser
    await browser.close();
    return htmlContent;
}

export function getFullName(athlete: ParsedAthleteDetail) {
    const overrides = {
        "Alexander Volkanovski": "Alex Volkanovski",
        "Ilia Topuria": "Alexsandre Topuria",
        "Abus Magomedov": "Abusupiyan Magomedov",
        "Benoît Saint Denis": "Benoit Saint-Denis",
    }
    if (athlete.fullName in overrides) {
        return overrides[athlete.fullName as keyof typeof overrides].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    return athlete.fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function formatLastName(athlete: ParsedAthleteDetail) {
    const lastName = athlete.lastName;
    if (lastName == null) {
        return getFullName(athlete);
    }
    const overrides = {
        "Saint Denis": "Saint-Denis"
    }
    if (lastName in overrides) {
        return overrides[lastName as keyof typeof overrides].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    if (lastName.split(" ").length > 1) {
        return lastName.split(" ").pop().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    return lastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
