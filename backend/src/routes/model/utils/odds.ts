import * as cheerio from "cheerio";
import type {ParsedAthleteDetail} from "../../../services/espn/athlete/parser";
import {formatLastName, getFullName, launchBrowserAndFetchHTML} from "../utils";
import {ParsedEventDetail} from "../../../services/espn/event/parser";
import {findUrl, performSearch} from "../../../web-scraper/google";
import {EventOddsModel} from "../../../services/odds/model";
import type {ParsedCompetitionDetail} from "../../../services/espn/competition/parser";
import fs from "node:fs/promises";

function getPropOddsByFighter($ch: cheerio.CheerioAPI, fighter: ParsedAthleteDetail, fullName: string) {
    const lastName = formatLastName(fighter);
    const decisionText = `${lastName} wins by decision`;
    const tkoText = `${lastName} wins by TKO/KO`;
    const submissionText = `${lastName} wins by submission`;

    const moneylineElement = $ch(`th:contains("${fullName}")`,).filter((_index, elem) => {
        const element = $ch(elem);
        return element.next().prop("tagName") === "TD";
    });
    const decisionElement = $ch(`th:contains("${decisionText}")`).filter((_index, elem) => {
        const element = $ch(elem);
        const isExactText = element.text().trim() === decisionText;
        const nextElementIsTd = element.next().prop("tagName") === "TD";
        return isExactText && nextElementIsTd;
    })
    const submissionElement = $ch(`th:contains("${submissionText}")`).filter((_index, elem) => {
        const element = $ch(elem);
        const isExactText = element.text().trim() === submissionText;
        const nextElementIsTd = element.next().prop("tagName") === "TD";
        return isExactText && nextElementIsTd;
    })
    const tkoElement = $ch(`th:contains("${tkoText}")`).filter((_index, elem) => {
        const element = $ch(elem);
        const isExactText = element.text().trim() === tkoText;
        const nextElementIsTd = element.next().prop("tagName") === "TD";
        return isExactText && nextElementIsTd;
    })
    const returnObject = {
        moneyLine: "-1",
        byDecision: "-1",
        byTKO: "-1",
        bySubmission: "-1",
    }
    if (moneylineElement.text().length > 0) {
        const oddsArray = moneylineElement.parent().find('TD').map((_index, elem) => {
            return $ch(elem).text().trim();
        }).get().filter((elem) => elem.length > 0).map((elem) => {
            return elem.trim().replace("▼", "").replace("▲", "")
        });
        if (oddsArray.length > 0) {
            returnObject.moneyLine = oddsArray.shift();
        }
    }
    if (decisionElement.text().length > 0) {
        const oddsArray = decisionElement.parent().find('TD').map((_index, elem) => {
            return $ch(elem).text().trim();
        }).get().filter((elem) => elem.length > 0).map((elem) => {
            return elem.trim().replace("▼", "").replace("▲", "")
        });
        if (oddsArray.length > 0) {
            returnObject.byDecision = oddsArray.shift();
        }
    }
    if (submissionElement.text().length > 0) {
        const oddsArray = submissionElement.parent().find('TD').map((_index, elem) => {
            return $ch(elem).text().trim();
        }).get().filter((elem) => elem.length > 0).map((elem) => {
            return elem.trim().replace("▼", "").replace("▲", "")
        });
        if (oddsArray.length > 0) {
            returnObject.bySubmission = oddsArray.shift();
        }
    }
    if (tkoElement.text().length > 0) {
        const oddsArray = tkoElement.parent().find('TD').map((_index, elem) => {
            return $ch(elem).text().trim();
        }).get().filter((elem) => elem.length > 0).map((elem) => {
            return elem.trim().replace("▼", "").replace("▲", "")
        });
        if (oddsArray.length > 0) {
            returnObject.byTKO = oddsArray.shift();
        }
    }
    if (fullName === "Benoit Saint Denis") {
        console.log("Return Object: ", returnObject);
    }
    return returnObject;
}

async function getResultLink(event: ParsedEventDetail) {
    // console.log("FETCHING RESULT LINK");
    const searchQuery = event.name.split(":")[1];
    const results = await performSearch(searchQuery);
    // console.log("Perform Search Results: ", results);
    return findUrl(results, event.date);
}

async function getEventOdds(event: ParsedEventDetail) {
    let eventOdds = await EventOddsModel.findOne({eventId: {$eq: event.id}, eventName: {$eq: event.name}});
    if (eventOdds == null) {
        console.log("No Event Odds Found");
        const resultLink = await getResultLink(event);
        console.log("Result Link: ", resultLink.map(elem => [elem.link, elem.snippet]));
        const newEventOdds = new EventOddsModel({
            eventName: event.name,
            eventId: event.id,
            competitions: [],
            url: resultLink.length > 0 ? resultLink.map(elem => elem.link) : [],
        })
        eventOdds = await newEventOdds.save();
        return eventOdds;
    }
    // const equalsCheck = (a: string[], b: string[]) => {
    //     if (a.length !== b.length) {
    //         return false;
    //     }
    //     return a.every((elem) => b.includes(elem));
    // }

    const resultLink = await getResultLink(event);
    console.log("Result Link: ", resultLink.map(elem => [elem.link, elem.snippet]));
    if (resultLink.length > eventOdds.url.length) {
        console.log("Updating Event Odds with Result Link: ", event.id, event.name, resultLink.map(elem => elem.link));
        eventOdds = await EventOddsModel.findOneAndUpdate({
            eventId: {$eq: event.id},
            eventName: {$eq: event.name}
        }, {url: resultLink.map(elem => elem.link)});
        console.log("Updated Event Object: ", eventOdds);
        return eventOdds;
    }

    return eventOdds;
}

interface PropOdds {
    moneyLine: string;
    byDecision: string;
    byTKO: string;
    bySubmission: string;
}

function combineFetchedOdds(oddsArray: PropOdds[]): PropOdds {
    return oddsArray.reduce((acc: PropOdds, curr: PropOdds) => {
        Object.entries(curr).forEach(([key, value]) => {
            const betKey = key as keyof PropOdds;
            // If the current value is not "-1", use it, otherwise check if acc already has a non "-1" value
            if (value !== "-1") {
                acc[betKey] = value;
            } else if (acc[betKey] === "-1" || acc[betKey] === undefined) {
                acc[betKey] = ""; // Set to empty string if still "-1" or not yet defined
            }
        });
        return acc;
    }, {
        moneyLine: "-1",
        byDecision: "-1",
        byTKO: "-1",
        bySubmission: "-1",
    });
}

export async function getEventPropOdds(event: ParsedEventDetail, competitions: ParsedCompetitionDetail[]) {
    console.log("EVENT PROPERTIES: ", event.name, event.id);
    let eventOdds = await getEventOdds(event);

    if (eventOdds != null && eventOdds.competitions.length === competitions.length) {
        console.log("No need to fetch again...");
        return eventOdds;
    }

    console.log("Query Links: ", eventOdds.url);

    const htmlData = [];
    for (const result of eventOdds.url) {
        const filename = `${result.split("/").pop()}.html`;
        try {
            await fs.access(`./webpages/${filename}`)
            const htmlContent = await fs.readFile(`./webpages/${filename}`, 'utf8');
            htmlData.push(htmlContent);
        } catch (err) {
            const html = await launchBrowserAndFetchHTML(result);
            await fs.writeFile(`./webpages/${filename}`, html, 'utf8');
            htmlData.push(html);
        }
    }
    const competitionOdds = [];
    for (const competition of competitions) {
        const competitorOne = competition.competitors.find((elem) => elem.order === 1) as ParsedCompetitionDetail & {
            athlete: ParsedAthleteDetail
        };
        const competitorTwo = competition.competitors.find((elem) => elem.order === 2) as ParsedCompetitionDetail & {
            athlete: ParsedAthleteDetail
        };

        const fighterOneFullName = getFullName(competitorOne.athlete as ParsedAthleteDetail);
        const fighterTwoFullName = getFullName(competitorTwo.athlete as ParsedAthleteDetail);

        const fighterOnePropOddsArray = [];
        const fighterTwoPropOddsArray = [];
        for (const html of htmlData) {
            const $ = cheerio.load(html);
            const fighterOnePropOdds = getPropOddsByFighter($, competitorOne.athlete as ParsedAthleteDetail, fighterOneFullName);
            const fighterTwoPropOdds = getPropOddsByFighter($, competitorTwo.athlete as ParsedAthleteDetail, fighterTwoFullName);
            fighterOnePropOddsArray.push(fighterOnePropOdds);
            fighterTwoPropOddsArray.push(fighterTwoPropOdds);
        }
        const fighterOneOdds = combineFetchedOdds(fighterOnePropOddsArray);
        const fighterTwoOdds = combineFetchedOdds(fighterTwoPropOddsArray);

        console.log("Fighter One: ", fighterOneFullName, "Odds: ", fighterOneOdds);
        console.log("Fighter Two: ", fighterTwoFullName, "Odds: ", fighterTwoOdds);

        const competitionOddsObject = {
            competitionId: competition.id,
            fighterOne: fighterOneOdds,
            fighterTwo: fighterTwoOdds,
        }
        const fighterOneDataFound = !Object.values(fighterOneOdds).some((elem) => elem === "-1")
        const fighterTwoDataFound = !Object.values(fighterTwoOdds).some((elem) => elem === "-1")
        if (fighterOneDataFound && fighterTwoDataFound) {
            competitionOdds.push(competitionOddsObject);
        }
    }

    if(competitionOdds.length !== competitions.length){
        console.log("Missing Competitions: ", competitionOdds.length, competitions.length);
    }
    if (competitionOdds.length !== eventOdds.competitions.length) {
        // console.log("Updating Event Odds with: ", competitionOdds);
        eventOdds = await EventOddsModel.findOneAndUpdate({
            eventId: {$eq: event.id},
            eventName: {$eq: event.name}
        }, {competitions: competitionOdds});
        return eventOdds;
    }
    return eventOdds;
}
