import {Service} from "../../service";
import {AthleteFullEventLogParser, AthletePaginatedEventLogParser, type ParsedAthleteFullEventLog} from "./parser";
import {AthleteEventLogModel} from "./model";


type ServiceTarget = {
    athleteId: string;
}

// Expiry of 7 Days
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24 * 7;

export class AthleteEventLogService extends Service<ParsedAthleteFullEventLog, ServiceTarget> {
    public serviceName = "AthleteEventLogService";
    public validator = AthleteFullEventLogParser;
    public Model = AthleteEventLogModel;

    public getFetchUrl(forceBuild: boolean = false): string {
        if (!forceBuild && typeof this.target === "string") {
            return this.target;
        }
        const variables = this.getVariables();
        return `https://sports.core.api.espn.com/v2/sports/mma/athletes/${variables.athleteId}/eventlog`
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

    public async fetchFromApi() {
        const jsonData = await this.fetchAndCheckResponse();
        const parsed = AthletePaginatedEventLogParser.parse(jsonData);
        const allEvents = [...parsed.events.items];
        const {athleteId} = this.getVariables();
        // Has More than 1 Page of Events
        if (parsed.events.pageCount > 1) {
            for (let page = 2; page <= parsed.events.pageCount; page++) {
                console.log(`[${this.serviceName}] Athlete ${athleteId} Fetching Next Page ${page}...`);
                const nextPage = await this.fetchAndCheckResponse(`${this.getFetchUrl(true)}?page=${page}`);
                const parsedNextPage = AthletePaginatedEventLogParser.parse(nextPage);
                allEvents.push(...parsedNextPage.events.items);
            }
        }
        const athleteEventLog = {
            $ref: parsed.$ref,
            athleteId: athleteId,
            events: allEvents
        }
        const parsedEventLog = this.validator.parse(athleteEventLog);
        return await this.handleServiceContext<ParsedAthleteFullEventLog>(parsedEventLog);
    }

    public async get() {
        try {
            const {athleteId} = this.getVariables();
            const recentCache = await this.getLatest({"data.athleteId": {$eq: athleteId}}, cacheLifetime);
            return await this.cacheHandler(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }
}
