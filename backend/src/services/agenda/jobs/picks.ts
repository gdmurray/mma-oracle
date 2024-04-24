/**
 * These are pretty high load tasks, might be worth putting these in a Golang API?
 * Breakdown of Picks Tasks
 * 1. compute_competition_picks: [Dynamic, {eventId, competitionId}] One Off, is Queued when fight_concluded is completed
 * 2. compute_event_user_percentile
 */
