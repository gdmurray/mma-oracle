import {Service} from "../../service";
import {CompetitionDetailValidator, type ParsedCompetitionDetail} from "./parser";
import {CompetitionModel} from "./model";


type ServiceTarget = {
    eventId: string;
    competitionId: string;
}

// Expiry of 7 Days
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24 * 7;

export class CompetitionService extends Service<ParsedCompetitionDetail, ServiceTarget> {
    public serviceName = "CompetitionService";
    public validator = CompetitionDetailValidator;
    public Model = CompetitionModel;

    public getFetchUrl(): string {
        if (typeof this.target === "string") {
            return this.target;
        }
        return `https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events/${this.target.eventId}/competitions/${this.target.competitionId}`
    }

    private getVariables(): ServiceTarget {
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



    public async get(): Promise<ParsedCompetitionDetail> {
        try {
            if(this.isLive() === true){
                return await this.getLiveData();
            }
            const variables = this.getVariables();
            const recentCache = await this.getLatest({"data.id": {$eq: variables.competitionId}}, cacheLifetime);
            return await this.cacheHandler<ParsedCompetitionDetail>(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
        return;
    }
}
