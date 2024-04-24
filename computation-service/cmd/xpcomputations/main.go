package xpcomputations

import (
	"log"
	"net/http"

	"computation-service/pkg/config"
	"computation-service/pkg/database"
	"computation-service/pkg/xp"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	// Connect to database
	db, err := database.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	// Setup Processor with db connection
	processor := xp.NewProcessor(db)

	// Setup HTTP Server
	http.HandleFunc("/competition/xp", processor.HandleCompetitionXP)
	http.HandleFunc("/event/xp", processor.HandleEventXP)
	http.HandleFunc("/event/percentile", processor.HandleCompetitionXP)

	log.Println("Starting server on port 8088")
	if err := http.ListenAndServe("8088", nil); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}

}
