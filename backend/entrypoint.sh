#!/bin/bash
# Wait for Postgres to become available.
# You might want to use a more sophisticated script for waiting.
sleep 10

# Run migrations
mix ecto.create
mix ecto.migrate

# Start the Phoenix web server
exec mix phx.server
