import {CalendarEventModel} from "./model";
import {type ParsedCalendarList, ScoreboardResponseValidator} from "./parser";
import {Service} from "../../service";

// Expiry of 1 Day
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24;

export class CalendarService extends Service<ParsedCalendarList, any> {
    public serviceName = "CalendarService";
    public validator = ScoreboardResponseValidator;
    public Model = CalendarEventModel;

    getFetchUrl(): string {
        return "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard"
    }

    public async fetchFromApi(): Promise<ParsedCalendarList> {
        const data = await this.fetchAndCheckResponse();
        let parsed = ScoreboardResponseValidator.parse(data);
        if (parsed.leagues.length === 0) {
            throw new Error("No Leagues Found in Calendar");
        }
        const [{calendar}] = parsed.leagues;
        return await this.handleServiceContext(calendar);
    }

    public async get(): Promise<ParsedCalendarList> {
        try {
            const recentCache = await this.getLatest({}, cacheLifetime);
            return await this.cacheHandler<ParsedCalendarList>(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }
}
