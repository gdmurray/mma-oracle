import {Service} from "../../service";
import {AthleteStatisticsValidator, type ParsedAthleteStatistics} from "./parser";
import {AthleteStatisticsModel} from "./model";


type ServiceTarget = {
    athleteId: string;
}

// Expiry of 7 Days
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24 * 7;

export class AthleteStatisticsService extends Service<ParsedAthleteStatistics, ServiceTarget> {
    public serviceName = "AthleteStatisticsService";
    public validator = AthleteStatisticsValidator;
    public Model = AthleteStatisticsModel;

    public getFetchUrl(): string {
        if (typeof this.target === "string") {
            return this.target;
        }
        return `https://sports.core.api.espn.com/v2/sports/mma/athletes/${this.target.athleteId}/statistics`
    }

    public getVariables() {
        if (typeof this.target === "string") {
            const regex = /\/athletes\/(\d+)/;
            const match = this.target.match(regex);

            if (match && match[1]) {
                return {athleteId: match[1]};
            } else {
                throw new Error(`[${this.serviceName}] No ID found in URL`)
            }
        }
        return this.target;
    }

    public getFetchUrlRegexPattern(): RegExp {
        const {athleteId} = this.getVariables();
        return new RegExp(`/mma/athletes/${athleteId}/statistics`);
    }

    public async get(): Promise<ParsedAthleteStatistics> {
        try {
            const recentCache = await this.getLatest({
                'data.$ref': {
                    $regex: this.getFetchUrlRegexPattern(),
                    $options: 'i'
                }
            }, cacheLifetime);
            return await this.cacheHandler<ParsedAthleteStatistics>(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }
}
