#!/bin/sh

# Variables
BUCKET=$S3_BUCKET
BACKUP_NAME="postgres_backup_$(date +%Y-%m-%d_%H-%M-%S).sql.gz"

# PostgreSQL environment variables
PGHOST="postgres"
PGPORT="5432"
export PGDATABASE="${POSTGRES_DB}"  # Database name from your environment variables
PGUSER="${POSTGRES_USER}"  # Username from your environment variables
export PGPASSWORD="${POSTGRES_PASSWORD}"  # Password from your environment variables

# Perform the backup
pg_dumpall -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" | gzip > "${BACKUP_NAME}"

# Upload to Cloudflare R2
aws s3 cp "$BACKUP_NAME" s3://"$BUCKET"/postgres/"$BACKUP_NAME" --endpoint-url="${S3_ENDPOINT}"

# Cleanup
rm "$BACKUP_NAME"
