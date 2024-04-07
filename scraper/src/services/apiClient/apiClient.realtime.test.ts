import { expect, test } from 'vitest';
import {apiClient} from "./apiClient";

test('handles 50 requests with real timers', async () => {
    const totalRequests = 50;
    const requestsPerSecond = 5;
    const expectedMinimumTimeMs = (totalRequests / requestsPerSecond - 1) * 1000;

    // Ensure fetch is asynchronous and logs when called
    global.fetch = vi.fn(() =>
        new Promise(resolve => setTimeout(() => {
            console.log(`Fetch called at ${Date.now()}`);
            resolve({ json: () => Promise.resolve({}) });
        }, 100)) // Simulate a brief network delay
    ) as unknown as typeof fetch;

    const startTime = Date.now();

    const requests = Array.from({ length: totalRequests }, (_, i) =>
        apiClient.fetch(`https://example.com/resource/${i}`)
    );

    await Promise.all(requests);

    const elapsedTime = Date.now() - startTime;
    console.log(`Total elapsed time: ${elapsedTime}ms`);

    expect(elapsedTime).toBeGreaterThanOrEqual(expectedMinimumTimeMs);
    expect(fetch).toHaveBeenCalledTimes(totalRequests);
}, 30000); // Adjust timeout as needed
