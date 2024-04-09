#!/bin/bash

# Variables
BUCKET=$S3_BUCKET
BACKUP_NAME="mongo_backup_$(date +%Y-%m-%d_%H-%M-%S).gz"

# MongoDB environment variables
MONGO_HOST="mongodb"
MONGO_USER="${MONGO_INITDB_ROOT_USERNAME}"
MONGO_PASS="${MONGO_INITDB_ROOT_PASSWORD}"
MONGO_PORT="27017"

MONGO_URI="mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/?authSource=admin"

# Create a gzip compressed dump of the database
mongodump --uri="${MONGO_URI}" --archive="$BACKUP_NAME" --gzip

# Upload to Cloudflare R2
aws s3 cp "$BACKUP_NAME" s3://"$BUCKET"/mongodb/"$BACKUP_NAME" --endpoint-url="${S3_ENDPOINT}"

# Cleanup
rm "$BACKUP_NAME"
