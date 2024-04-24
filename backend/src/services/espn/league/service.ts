import {Service} from "../../service";
import {LeagueValidator, ParsedLeague} from "./parser";
import {LeagueDetailModel} from "./model";

type ServiceTarget = {
    leagueSlug: string;
}

// Cache lifetime of 1 week
const oneHour = 1000 * 60 * 60
const cacheLifetime = oneHour * 24 * 7;

export class LeagueService extends Service<ParsedLeague, ServiceTarget>{
    public serviceName = "LeagueService";
    public validator = LeagueValidator;
    public Model = LeagueDetailModel;

    public getFetchUrl(): string {
        if (typeof this.target === "string") {
            return this.target;
        }
        return `https://sports.core.api.espn.com/v2/sports/mma/leagues/${this.target.leagueSlug}`;
    }

    public getVariables(): ServiceTarget {
        if(typeof this.target === "string"){
            const regex = /leagues\/([^/?]+)/;
            const matches = this.target.match(regex);
            if(matches && matches.length > 1){
                return {leagueSlug: matches[1]};
            }else{
                throw new Error(`[${this.serviceName}] No ID found in URL`)
            }
        }
    }

    public async get(): Promise<ParsedLeague> {
        try {
            const variables = this.getVariables();
            const recentCache = await this.getLatest({"data.slug": {$eq: variables.leagueSlug}}, cacheLifetime);
            return await this.cacheHandler(recentCache);
        }catch (err){
            console.error("Failed to load data:", err);
        }
    }
}
