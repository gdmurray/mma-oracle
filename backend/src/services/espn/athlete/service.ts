import {Service} from "../../service";
import {AthleteDetailValidator, type ParsedAthleteDetail} from "./parser";
import {AthleteDetailModel} from "./model";

// Expiry of 1 Day
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24;

type ServiceTarget = {
    athleteId: string;
}

export class AthleteService extends Service<ParsedAthleteDetail, ServiceTarget> {
    public serviceName = "AthleteService";
    public validator = AthleteDetailValidator;
    public Model = AthleteDetailModel;
    public getFetchUrl(): string {
        if (typeof this.target === "string") {
            return this.target;
        }
        return `https://sports.core.api.espn.com/v2/sports/mma/athletes/${this.target.athleteId}`
    }

    private getVariables(): ServiceTarget {
        if (typeof this.target === "string") {
            const regex = /\/athletes\/(\d+)/;
            const matches = this.target.match(regex);

            // If there's a match, return the first capturing group (the ID)
            if (matches && matches.length > 1) {
                return {athleteId: matches[1]};
            } else {
                throw new Error(`[${this.serviceName}] No ID found in URL`) // Return null if no ID is found
            }
        }
        return this.target;
    }

    public async get(): Promise<ParsedAthleteDetail> {
        try {
            const variables = this.getVariables();
            const recentCache = await this.getLatest({"data.id": {$eq: variables.athleteId}}, cacheLifetime);
            return await this.cacheHandler(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }
}
