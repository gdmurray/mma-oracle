// import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
// import {apiClient} from "./apiClient";
//
// // Mock the global fetch function
// global.fetch = vi.fn(() =>
//     Promise.resolve({
//         json: () => Promise.resolve({}),
//     })
// ) as unknown as typeof fetch;
//
// beforeEach(() => {
//     vi.useFakeTimers();
//     vi.clearAllMocks();
// });
//
// afterEach(() => {
//     vi.useRealTimers();
// });
//
// describe('APIClient rate limiting', () => {
//     it('processes up to the limit per second', async () => {
//         const requestCount = 5;
//         const requests = [];
//
//         for (let i = 0; i < requestCount; i++) {
//             requests.push(apiClient.fetch(`https://example.com/resource/${i}`));
//         }
//
//         // Move forward in time by 1 second to simulate API delay
//         vi.advanceTimersByTime(1000);
//
//         await Promise.all(requests);
//
//         expect(fetch).toHaveBeenCalledTimes(requestCount);
//     });
//
//     it('delays requests to adhere to rate limit', async () => {
//         const requestCount = 10; // Double the rate limit
//         const requests = [];
//
//         for (let i = 0; i < requestCount; i++) {
//             requests.push(apiClient.fetch(`https://example.com/resource/${i}`));
//         }
//
//         // Fast-forward until all timers have been executed
//         vi.runAllTimers();
//
//         await Promise.all(requests);
//
//         // Should have been called 10 times in total
//         expect(fetch).toHaveBeenCalledTimes(requestCount);
//     });
//
//     it('spreads out requests exceeding limit over appropriate time', async () => {
//         // Queue the first batch of requests
//         const firstBatchPromises = [
//             apiClient.fetch('https://example.com/resource/first'),
//             apiClient.fetch('https://example.com/resource/second'),
//             apiClient.fetch('https://example.com/resource/third'),
//             apiClient.fetch('https://example.com/resource/fourth'),
//             apiClient.fetch('https://example.com/resource/fifth')
//         ];
//
//         // Advance time to allow for the first batch of requests
//         vi.advanceTimersByTime(1000);
//
//         // Await the resolution of the first batch to ensure they're processed
//         await Promise.all(firstBatchPromises);
//
//         // Queue the second batch of requests
//         const secondBatchPromise = apiClient.fetch('https://example.com/resource/sixth');
//
//         // This time advance is crucial to simulate the delay introduced by rate limiting
//         vi.advanceTimersByTime(200);
//
//         // Await the resolution of the second batch to ensure they're processed
//         await secondBatchPromise;
//
//         expect(fetch).toHaveBeenCalledTimes(6); // The first five, plus the sixth
//
//         // Queue another request which should also be delayed
//         const thirdBatchPromise = apiClient.fetch('https://example.com/resource/seventh');
//
//         // Advance time to allow the third request to be processed
//         vi.advanceTimersByTime(800);
//
//         await thirdBatchPromise;
//
//         expect(fetch).toHaveBeenCalledTimes(7); // All seven should have been called
//     }, 30000);
//
//     it('handles 100 requests with rate limiting', async () => {
//         const totalRequests = 100;
//         const requestsPerSecond = 5;
//         const expectedMinimumTimeMs = (totalRequests / requestsPerSecond - 1) * 1000; // Subtract 1 because the first batch doesn't need to wait
//
//         // Record the start time
//         const startTime = Date.now();
//
//         // Queue 100 requests
//         const requestPromises = [];
//         for (let i = 0; i < totalRequests; i++) {
//             requestPromises.push(apiClient.fetch(`https://example.com/resource/${i}`));
//         }
//
//         // Advance the fake timers just past the expected minimum time
//         vi.advanceTimersByTime(expectedMinimumTimeMs);
//
//         // Wait for all requests to resolve
//         await Promise.all(requestPromises);
//
//         // Calculate the actual elapsed time
//         const endTime = Date.now();
//         const actualElapsedTimeMs = endTime - startTime;
//
//         // Ensure the actual elapsed time is within the expected range
//         // This checks if the rate limiting correctly spaced out the requests over time
//         expect(actualElapsedTimeMs).toBeGreaterThanOrEqual(expectedMinimumTimeMs);
//
//         // Also, verify the total number of times fetch was called matches the number of requests
//         expect(fetch).toHaveBeenCalledTimes(totalRequests);
//     }, 30000);
// });
