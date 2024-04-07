import {CompetitionStatusValidator, type ParsedCompetitionStatus} from "./parser";
import {Service} from "../service";
import {CompetitionStatusModel} from "./model";

type ServiceTarget = {
    eventId: string;
    competitionId: string;
}

// Expiry of 1 Day
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24;

export class CompetitionStatusService extends Service<ParsedCompetitionStatus, ServiceTarget> {
    public serviceName = "CompetitionStatusService";
    public validator = CompetitionStatusValidator;
    public Model = CompetitionStatusModel;

    public getFetchUrl(): string {
        if (typeof this.target === "string") {
            return this.target;
        }
        return `https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events/${this.target.eventId}/competitions/${this.target.competitionId}/status`
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

    public getFetchUrlRegexPattern(): RegExp {
        const {eventId, competitionId} = this.getVariables();
        return new RegExp(`/events/${eventId}/competitions/${competitionId}/status`);
    }

    async get(): Promise<ParsedCompetitionStatus> {
        try {
            if(this.isLive()){
                return await this.getLiveData();
            }
            const recentCache = await this.getLatest({
                'data.$ref': {
                    $regex: this.getFetchUrlRegexPattern(),
                    $options: 'i'
                }
            }, cacheLifetime);
            return await this.cacheHandler<ParsedCompetitionStatus>(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
        return;
    }
}
