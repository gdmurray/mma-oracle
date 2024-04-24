package xp

import (
	"context"
	"database/sql"
	"log"
)

type CompetitionResult struct {
	Id       string
	WinnerId string
	Round    int
	Method   string
}

type CompetitionOdds struct {
	Moneyline  float32
	Decision   float32
	Tko        float32
	Submission float32
	AthleteId  string
}

func UpdateUserEventOutcomesPercentiles(db *sql.DB, eventId string) error {
	query := `
		WITH ranked_outcomes AS (
			SELECT
				id,
				percent_rank() OVER (PARTITION BY "eventId" ORDER BY xp DESC) AS percentile
			FROM
				"UserEventOutcome"
			WHERE
			    "eventId" = $1
		)
		UPDATE 
			"UserEventOutcome"
		SET
			percentile = ranked_outcomes.percentile
		FROM
			ranked_outcomes
		WHERE
			"UserEventOutcome".id = ranked_outcomes.id AND
			"UserEventOutcome"."eventId" = $1
		
	`
	_, err := db.Exec(query, eventId)
	if err != nil {
		log.Printf("Error updating user event outcomes percentiles: %v", err)
		return err
	}

	log.Println("Successfully updated percentiles for user event outcomes")
	return nil
}

func ProcessCompetitionXP(ctx context.Context, db *sql.DB, competitionId string) error {

	// Fetch Related CompetitionResult and Picks
	var result CompetitionResult
	resultQuery := `
		SELECT 
		    id, "winnerId", "round", "method" 
		FROM "CompetitionResult" 
		WHERE "competitionId" = $1
	`
	err := db.QueryRowContext(ctx, resultQuery, competitionId).Scan(
		&result.Id,
		&result.WinnerId,
		&result.Round,
		&result.Method)

	if err != nil {
		log.Printf("Error fetching competition result: %v", err)
		return err
	}

	var winnerOdds CompetitionOdds
	oddsQuery := `
		SELECT 
		    "moneyLine", "decision", "tko", "submission", "athleteId" 
		FROM "CompetitorOdds" 
		WHERE 
		    "competitionId" = $1 AND 
		    "athleteId" = $2
	`
	err = db.QueryRowContext(ctx, oddsQuery, competitionId, result.WinnerId).Scan(
		&winnerOdds.Moneyline,
		&winnerOdds.Decision,
		&winnerOdds.Tko,
		&winnerOdds.Submission,
		&winnerOdds.AthleteId)

	var pickedWinner = true
	if err != nil {
		if err == sql.ErrNoRows {
			pickedWinner = false
		} else {
			log.Printf("Error Fetching winner odds: %v", err)
		}
	}
	picksQuery := `
	SELECT 
	    id, 
	    "userId", 
	    "athleteId", 
	    "method", 
	    "methodRound", 
	    "doubleDown", 
	    "boost" 
	FROM "Pick" WHERE "competitionId" = $1
`
	rows, err := db.QueryContext(ctx, picksQuery, competitionId)
	if err != nil {
		log.Printf("Error fetching picks: %v", err)
		return err
	}

	defer rows.Close()

	for rows.Next() {
		var pickId, userId, athleteId, method, methodRound, doubleDown, boost string
		if err := rows.Scan(&pickId, &userId, &athleteId, &method, &methodRound, &doubleDown, &boost); err != nil {
			log.Printf("Error scanning pick: %v", err)
			return err
		}

		if pickedWinner {
			log.Printf("Picked Winner")
		}

		// Compute Xp
		won := true
		xp := 0

		_, err = db.ExecContext(ctx, `
			INSERT INTO "PickOutcome" ("pickId", xp, won) VALUES ($1, $2, $3)
		`, pickId, xp, won)

		if err != nil {
			log.Printf("Error inserting pick outcome: %v", err)
			return err
		}
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error iterating picks: %v", err)
		return err
	}
	return nil
}
