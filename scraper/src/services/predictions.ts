import {ParsedCompetitionDetail} from "./competition/parser";
import {apiClient} from "./apiClient/apiClient";
import {americanToDecimal, getESPNOdds, processFightersRecords, weightConversions} from "../routes/model/utils";
import {AthleteService} from "./athlete/service";
import type {ServiceContext} from "./context";

const athleteServiceContext: ServiceContext = {
    services: {
        eventLog: "AthleteEventLogService",
        competition: "CompetitionService",
        status: "CompetitionStatusService",
        statistics: "AthleteStatisticsService",
        records: "AthleteRecordsService",
    }
};

export class PredictionService {
    public competition: ParsedCompetitionDetail;
    private apiEndpoint = "http://127.0.0.1:5555/api/predict"
    private client = apiClient;

    constructor(competition: ParsedCompetitionDetail) {
        this.competition = competition;
    }

    private async preparePayload() {
        const competitorOne = this.competition.competitors.find((elem) => elem.order === 1);
        const competitorTwo = this.competition.competitors.find((elem) => elem.order === 2);

        const odds = getESPNOdds(this.competition);
        const fighterOneOdds = odds.homeAthleteOdds.current.decimal ?? americanToDecimal(odds.homeAthleteOdds.moneyLine.toString());
        const fighterTwoOdds = odds.awayAthleteOdds.current.decimal ?? americanToDecimal(odds.awayAthleteOdds.moneyLine.toString());

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

        const payload = [];
        for (let index = 0; index < 2; index++) {
            const [fighterOne, fighterTwo] = index === 0 ? [fighters[0], fighters[1]] : [fighters[1], fighters[0]];
            for (const key of Object.keys(methodKeys)) {
                const statMap = {
                    "byTKO": {
                        "F1 MTHD W": fighterOne.record.tkoWins,
                        "F2 MTHD L": fighterTwo.record.tkoLosses,
                        "F1 S1": fighterOne.record.strikeAccuracy,
                        "F2 S1": fighterTwo.record.strikeAccuracy,
                        "F1 S2": fighterOne.record.strikeLPM,
                        "F2 S2": fighterTwo.record.strikeLPM
                    },
                    "bySubmission": {
                        "F1 MTHD W": fighterOne.record.submissionWins,
                        "F2 MTHD L": fighterTwo.record.submissionLosses,
                        "F1 S1": fighterOne.record.takedownAccuracy,
                        "F2 S1": fighterTwo.record.takedownAccuracy,
                        "F1 S2": fighterOne.record.submissionAttemptAverage,
                        "F2 S2": fighterTwo.record.submissionAttemptAverage
                    },
                    "byDecision": {
                        "F1 MTHD W": fighterOne.record.decisionWins,
                        "F2 MTHD L": fighterTwo.record.decisionLosses,
                        "F1 S1": fighterOne.record.strikeLPM,
                        "F2 S1": fighterTwo.record.strikeLPM,
                        "F1 S2": fighterOne.record.decisionPercentage,
                        "F2 S2": fighterTwo.record.decisionPercentage,
                    }
                }
                const dataRow = {
                    Label: `${index === 0 ? "FighterOne" : "FighterTwo"}By${key.replace("by", "")}`,
                    "F1 ML": fighterOne.odds,
                    "F2 ML": fighterTwo.odds,
                    ...statMap[key as keyof typeof statMap],
                    "F1 Mom": fighterOne.record.momentum,
                    "F2 Mom": fighterTwo.record.momentum,
                    "F1 Age": fighterOne.record.age,
                    "F2 Age": fighterTwo.record.age,
                    "F1 H": fighterOne.record.height,
                    "F2 H": fighterTwo.record.height,
                    "F Weight": weightConversions[this.competition.type.abbreviation as keyof typeof weightConversions] ?? athleteOneData.weight ?? athleteTwoData.weight,
                }
                payload.push(dataRow);
            }
        }
        return payload;
    }

    public async getPredictions() {
        console.log("Preparing Payload for ", this.competition.id);
        const payload = await this.preparePayload();
        const response = await this.client.fetch(this.apiEndpoint, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if(!response.ok){
            throw new Error("Error Fetching Odds")
        }
        const data = await response.json();
        return data;
        console.log("Response: ", response);
    }


}
