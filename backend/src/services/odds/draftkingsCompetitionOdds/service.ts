import {Service} from "../../service";
import {DraftKingsCompetitionOdds, DraftKingsCompetitionOddsModel} from "./model";
import {DraftKingsService} from "../draftkings/service";
import {ParsedCompetitionDetail} from "../../espn/competition/parser";
import Fuse from 'fuse.js'
import {ParsedAthleteDetail} from "../../espn/athlete/parser";


type ServiceTarget = {
    competition: ParsedCompetitionDetail;
}

// Expiry of 6 Hours
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 6;

// This class needs to be able to handle returning null if the data is not found
export class DraftKingsCompetitionOddsService extends Service<DraftKingsCompetitionOdds, ServiceTarget> {
    public serviceName = "DraftKingsCompetitionOddsService";
    public Model = DraftKingsCompetitionOddsModel;

    public constructor(target: ServiceTarget, serviceContext: any = undefined) {
        super(target, serviceContext);
    }

    public async fetchFromApi(): Promise<DraftKingsCompetitionOdds | null> {
        if (typeof this.target === "string") {
            return null;
        }
        const {competition} = this.target;
        // console.log("RECEIVED COMPETITION: ", competition);
        const draftKingsService = new DraftKingsService();
        const draftKingsData = await draftKingsService.get();

        if (draftKingsData == null) {
            return null;
        }

        const {events, offerCategories} = draftKingsData.eventGroup;

        const {athlete: athleteOne} = competition.competitors.find((elem) => elem.order === 1) as ParsedCompetitionDetail & {
            athlete: ParsedAthleteDetail
        };
        const {athlete: athleteTwo} = competition.competitors.find((elem) => elem.order === 2) as ParsedCompetitionDetail & {
            athlete: ParsedAthleteDetail
        };

        const options = {
            includeScore: true,
            keys: ['name']
        }
        const searchQuery = `${athleteOne.fullName} vs ${athleteTwo.fullName}`;
        const fuse = new Fuse(events, options);
        const fuseResult = fuse.search(searchQuery);

        if (fuseResult.length === 0) {
            return null;
        }
        const mostRelevantResult = fuseResult[0];
        if (mostRelevantResult.score > 0.6) {
            console.error("Most Relevant score did not match threshold")
            return null;
        }

        const {item: {eventId}} = mostRelevantResult;

        const winningMethodCategory = offerCategories.find(category => category.offerCategoryId === 726);
        if (winningMethodCategory == null) {
            return null;
        }
        const methodOfVictorySubcategory = winningMethodCategory.offerSubcategoryDescriptors.find(subcategory => subcategory.subcategoryId === 6435);
        if (methodOfVictorySubcategory == null) {
            return null;
        }
        const {offerSubcategory} = methodOfVictorySubcategory;
        const {offers} = offerSubcategory;
        const offerGroup = offers.find(subOffers => subOffers.some(elem => elem.eventId === eventId));
        if (offerGroup == null) {
            return null;
        }
        const {outcomes} = offerGroup[0];

        const fuseOptions = {
            includeScore: true,
            keys: ['label']
        }

        const outcomeFuse = new Fuse(outcomes, fuseOptions);
        const outcomeMap = {
            byTKO: "To Win By KO/TKO/DQ",
            byDecision: "To Win By Decision",
            bySubmission: "To Win By Submission"
        }
        const data = {
            competitionId: competition.id,
            fighterOne: {
                byDecision: -1,
                byTKO: -1,
                bySubmission: -1
            },
            fighterTwo: {
                byDecision: -1,
                byTKO: -1,
                bySubmission: -1
            }
        }
        const fighters = {fighterOne: athleteOne.fullName, fighterTwo: athleteTwo.fullName};
        for (let [fighter, fullName] of Object.entries(fighters)) {
            for (let [key, value] of Object.entries(outcomeMap)) {
                const searchString = `${fullName} ${value}`;
                const fuseOutcomeResult = outcomeFuse.search(searchString);
                if (fuseOutcomeResult == null || fuseOutcomeResult.length === 0) {
                    console.error("Could not find a result for ", searchString);
                    return null;
                }
                const mostRelevantOutcome = fuseOutcomeResult[0];
                if (mostRelevantOutcome.score > 0.6) {
                    console.error("Could not find a relevant result for ", searchString);
                    return null;
                }
                const {item} = mostRelevantOutcome;
                // @ts-ignore
                data[fighter][key] = item.oddsDecimal;
            }
        }
        return data;
    }

    public async cacheHandler(data: any) {
        if (data != null) {
            return data.data.toObject()
        } else {
            const fetchedData = await this.fetchFromApi();
            if (fetchedData == null) {
                return fetchedData;
            }
            const newRecord = new this.Model({data: fetchedData, lastFetched: new Date()});
            await newRecord.save();
            return fetchedData;
        }
    }

    public async get() {
        try {
            const recentCache = await this.getLatest({'data.competitionId': {$eq: (this.target as ServiceTarget).competition.id}}, cacheLifetime);
            return this.cacheHandler(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }


}
