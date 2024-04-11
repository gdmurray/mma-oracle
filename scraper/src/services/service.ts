import type {FilterQuery, Model} from "mongoose";
import {replaceRefs, type ServiceContext} from "./context";
import {apiClient} from "./apiClient/apiClient";

export type VariablesOrUrl<T> = T | string;

export class Service<T, S> {
    public Model: Model<any>;
    public cacheLifetime: number;
    public validator: any;
    public target: VariablesOrUrl<S>;
    public serviceContext: ServiceContext;
    public serviceName: string;
    public apiClient = apiClient;
    private debug = false;

    constructor(target?: VariablesOrUrl<S>, serviceContext?: ServiceContext) {
        this.target = target;
        this.serviceContext = serviceContext;
    }

    public getFetchUrl(): string {
        return "";
    };

    public async fetchAndCheckResponse(fetchUrl?: string): Promise<any> {
        const response = await this.apiClient.fetch(fetchUrl ?? this.getFetchUrl());
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`)
        }
        const data = await response.json();
        if (data != null) {
            return data;
        }
        throw new Error("Error Fetching Data");
    }

    public async handleFetchFromApi<T>(validator: any): Promise<T> {
        const jsonData = await this.fetchAndCheckResponse();
        let {success, data, error} = validator.safeParse(jsonData);
        if (!success) {
            console.error(`[${this.serviceName}] Failed to parse data: `, error, jsonData);
            throw new Error(`[${this.serviceName}] Failed to parse data`)
        }
        return data;
    }

    public async saveToCache() {
        const data = await this.fetchFromApi();
        const newRecord = new this.Model({data: data, lastFetched: new Date()});
        await newRecord.save();
        return;
    }

    public async fetchFromApi(): Promise<T> {
        return await this.handleFetchFromApi(this.validator);
    };

    public get(_query?: FilterQuery<any>): Promise<T> {
        return;
    }

    public isLive(): boolean {
        if (this.serviceContext != null && this.serviceContext.live != null) {
            return this.serviceContext.live;
        }
        return false;
    }

    public async getLiveData(): Promise<T> {
        const data = await this.fetchFromApi();
        return await this.handleServiceContext<T>(data)
    }

    public async handleServiceContext<T>(data: T) {
        if (this.serviceContext != null && Object.keys(this.serviceContext.services).length > 0) {
            return await replaceRefs<T>(data, this.serviceContext)
        }
        return data;
    }

    public getFetchUrlRegexPattern(): RegExp {
        // const baseUrl = this.getFetchUrl();
        // const escapedUrl = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
        // return `^${escapedUrl}(\\?.*)?$`; // Allow for optional query string
        return;
    }

    public async cacheHandler<T>(data: any) {
        if (data != null) {
            if (this.debug) {
                console.debug(`[${this.serviceName}] Cache Hit`)
            }
            return await this.handleServiceContext<T>(data.data.toObject())
        } else {
            if (this.debug) {
                console.debug(`[${this.serviceName}] Cache Miss`)
            }
            const fetchedData = await this.fetchFromApi();
            const newRecord = new this.Model({data: fetchedData, lastFetched: new Date()});
            await newRecord.save();
            return await this.handleServiceContext<T>(fetchedData as T);
        }
    }

    public async getLatest(query: any, cacheLifetime: number) {
        return await this.Model.findOne({
            ...query,
            lastFetched: {$gte: new Date(Date.now() - cacheLifetime)},
        }).sort({lastFetched: -1}) // Sort by date in descending order
            .exec(); // Execute the query;
    }
}
