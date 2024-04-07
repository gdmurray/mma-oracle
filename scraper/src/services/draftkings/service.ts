import {Service} from "../service";
import {DraftKingsValidator, ParsedDraftKingsResponse} from "./parser";
import {DraftKingsModel} from "./model";


// Expiry of 6 Hours
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 6;

export class DraftKingsService extends Service<ParsedDraftKingsResponse, any> {
    public serviceName = "DraftKingsService";
    public validator = DraftKingsValidator;
    public Model = DraftKingsModel;

    constructor(target = {}, serviceContext: any = undefined) {
        super(target, serviceContext);
    }

    public getFetchUrl(): string {
        // TODO: Convert to environment variable :)
        return "https://sportsbook-nash-caon.draftkings.com/sites/CA-ON-SB/api/v5/eventgroups/9034/categories/726/subcategories/6435"
    }

    public async fetchFromApi() {
        const jsonData = await this.fetchAndCheckResponse();
        return this.validator.parse(jsonData);
    }

    public async get(): Promise<ParsedDraftKingsResponse> {
        try {
            const recentCache = await this.getLatest({}, cacheLifetime);
            return await this.cacheHandler(recentCache);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }
}
