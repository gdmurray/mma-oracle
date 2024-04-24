class APIClient {
    private static instance: APIClient;
    private requestsPerSecond: number = 5;
    private queue: Array<() => Promise<void>> = [];
    private requestsTimestamps: number[] = [];

    private constructor(requestsPerSecond: number = 5) {
        this.requestsPerSecond = requestsPerSecond;
    }

    public static getInstance(): APIClient {
        if (!APIClient.instance) {
            APIClient.instance = new APIClient();
        }
        return APIClient.instance;
    }

    public async fetch(url: string, init?: FetchRequestInit): Promise<Response> {
        return new Promise((resolve, reject) => {
            this.queue.push(() => this.processFetch({url, init}, resolve, reject));
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.queue.length === 0) {
            return;
        }

        // Remove timestamps older than 1 second
        const now = Date.now();
        this.requestsTimestamps = this.requestsTimestamps.filter(timestamp => now - timestamp < 1000);

        if (this.requestsTimestamps.length < this.requestsPerSecond) {
            // If we haven't reached the limit, process the next request
            const task = this.queue.shift();
            if (task) {
                this.requestsTimestamps.push(Date.now()); // Record the request timestamp
                task();
            }
        }

        // Check again in 100ms
        setTimeout(() => this.processQueue(), 100);
    }

    private async processFetch({url, init}: {
        url: string;
        init?: FetchRequestInit
    }, resolve: (value: Response | PromiseLike<Response>) => void, reject: (reason?: any) => void) {
        try {
            console.log(`Fetching: ${url} at ${new Date().toISOString()}`);
            const response = await fetch(url, init); // Simulated fetch call
            resolve(response);
        } catch (error) {
            reject(error);
        }
    }
}

// Export a singleton instance
export const apiClient = APIClient.getInstance();
