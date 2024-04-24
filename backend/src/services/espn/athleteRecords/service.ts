import {Service} from "../../service";
import {AthleteRecordsValidator, type ParsedAthleteRecordItem} from "./parser";
import {AthleteRecordsModel} from "./model";

type ServiceTarget = {
    athleteId: string;
}

// Expiry of 7 Days
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24 * 7;

export class AthleteRecordsService extends Service<ParsedAthleteRecordItem, ServiceTarget> {
    public serviceName = "AthleteRecordsService";
    public validator = AthleteRecordsValidator;
    public Model = AthleteRecordsModel;

    public getFetchUrl(): string {
        if (typeof this.target === "string") {
            return this.target;
        }
        return `http://sports.core.api.espn.com/v2/sports/mma/athletes/${this.target.athleteId}/records`
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

    public getFetchUrlRegexPattern() {
        const {athleteId} = this.getVariables();
        return new RegExp(`/mma/athletes/${athleteId}/records`)
    }

    public async fetchFromApi(): Promise<ParsedAthleteRecordItem> {
        const jsonData = await this.fetchAndCheckResponse();
        const data = this.validator.parse(jsonData);
        if ("count" in data && "pageIndex" in data) {
            return data.items[0];
        }
        return data as ParsedAthleteRecordItem;
    }

    public async get(): Promise<ParsedAthleteRecordItem> {
        try {
            const recentCache = await this.getLatest({
                "data.$ref": {
                    $regex: this.getFetchUrlRegexPattern(),
                    $options: 'i'
                }
            }, cacheLifetime);
            return await this.cacheHandler<ParsedAthleteRecordItem>(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }
}
