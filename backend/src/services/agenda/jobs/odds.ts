/**
 * Breakdown of Odds Jobs (very nice Mr. Bond)
 * 1. fetch_scheduled_competition_odds: [Persistent] Every 24 Hours, Fetch Odds for Each Event in the Next 3 Weeks and Sync with Postgresql
 * 2. fetch_upcoming_event_competitions_odds: [Dynamic: {promotionId, eventId}] Every Hour, Starts Day of Event
 *      - Is Scoped to Event id
 *      - Is Cancelled by Event manager
 *      - Checks if all competitions for an event has odds, and if the source is model, checks if there are odds available through draftkings api
 *      - When competition has odds that's DK API, it stops fetching
 */
