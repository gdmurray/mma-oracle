import {Service} from "../service";
import {CompetitionOddsDataValidator, PaginatedCompetitionOdds, type ParsedCompetitionOddsData} from "./parser";
import {CompetitionOddsModel} from "./model";

type ServiceTarget = {
    eventId: string;
    competitionId: string;
}

// Expiry of 1 Day
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24;

export class CompetitionOddsService extends Service<ParsedCompetitionOddsData, ServiceTarget> {
    public serviceName = "CompetitionOddsService";
    public validator = CompetitionOddsDataValidator;
    public Model = CompetitionOddsModel;

    public getFetchUrl(): string {
        if (typeof this.target === "string") {
            return this.target;
        }
        return `https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events/${this.target.eventId}/competitions/${this.target.competitionId}/odds`
    }

    public async fetchFromApi(): Promise<ParsedCompetitionOddsData> {
        const jsonData = await this.fetchAndCheckResponse();
        if ("count" in jsonData && "pageIndex" in jsonData) {
            const data = PaginatedCompetitionOdds.parse(jsonData);
            return {
                competitionId: this.getVariables().competitionId,
                items: data.items,
            };
        }
        return this.validator.parse(jsonData);
    }

    public getVariables(): ServiceTarget {
        if (typeof this.target === "string") {
            // Regular expression to match the eventId and competitionId in the URL
            const regex = /\/events\/(\d+)\/competitions\/(\d+)/;
            const matches = (this.target as string).match(regex);
            if (matches) {
                const eventId = matches[1];
                const competitionId = matches[2]; // The third capture group is the competitionId
                return {eventId, competitionId};
            } else {
                throw new Error(`[${this.serviceName}] No ID found in URL`)
            }
        }
        return this.target;
    }

    async get(): Promise<ParsedCompetitionOddsData> {
        try {
            const recentCache = await this.getLatest({"data.competitionId": {$eq: this.getVariables().competitionId}}, cacheLifetime);
            return await this.cacheHandler(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
        return;
    }
}
