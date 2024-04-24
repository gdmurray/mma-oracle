import {Service} from "../../service";
import {EventDetailValidator, type ParsedEventDetail} from "./parser";
import {EventDetailModel} from "./model";

// Expiry of 1 Day
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24;

type ServiceTarget = {
    eventId: string;
}

export class EventService extends Service<ParsedEventDetail, ServiceTarget> {
    public serviceName = "EventService";
    public validator = EventDetailValidator;
    public Model = EventDetailModel;

    public getFetchUrl(): string {
        if (typeof this.target === "string") {
            return this.target;
        }
        return `https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events/${this.target.eventId}`;
    }

    private getVariables(): ServiceTarget {
        if (typeof this.target === "string") {
            const regex = /\/events\/(\d+)/;
            const matches = this.target.match(regex);

            // If there's a match, return the first capturing group (the ID)
            if (matches && matches.length > 1) {
                return {eventId: matches[1]};
            } else {
                throw new Error(`[${this.serviceName}] No ID found in URL`)
            }
        }
        return this.target;
    }

    public async get(): Promise<ParsedEventDetail> {
        try {
            const variables = this.getVariables();
            const recentCache = await this.getLatest({"data.id": {$eq: variables.eventId}}, cacheLifetime)
            return await this.cacheHandler(recentCache)
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }
}
