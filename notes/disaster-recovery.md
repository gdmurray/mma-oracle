# Database Restoration Guide

Connect to Backup container within docker-stack

```bash
docker ps
```

Once you get container id

```bash
docker exec -it <container_name_or_id> /bin/bash
```

## MongoDB Restore

Download the Backup from Cloudflare R2:
Use the AWS CLI configured for Cloudflare R2 to download your MongoDB backup.

```bash
aws s3 cp s3://$S3_BUCKET/mongodb/your_backup_file.gz . --endpoint-url=$S3_ENDPOINT
```

### Restore MongoDB Database:

Use mongorestore to restore the database from the backup file. If the backup is compressed with gzip (as indicated by .gz), use the --gzip flag.

```bash
mongorestore --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/?authSource=admin" --archive=your_backup_file.gz --gzip
```
Replace placeholders (${MONGO_USER}, ${MONGO_PASS}, ${MONGO_HOST}, ${MONGO_PORT}, your_backup_file.gz) with actual values.

## PostgreSQL Restore

Download the Backup from Cloudflare R2:
Similarly, use the AWS CLI to download your PostgreSQL backup.

```bash
aws s3 cp s3://$S3_BUCKET/postgres/your_backup_file.sql.gz . --endpoint-url=$S3_ENDPOINT
```

### Restore PostgreSQL Database:
First, uncompress the backup file if it's compressed.

```bash
gunzip your_backup_file.sql.gz
```

Then, use psql or pg_restore (depending on your backup format) to restore the database. For SQL dumps:

```bash
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f your_backup_file.sql
```

Replace placeholders ($PGHOST, $PGPORT, $PGUSER, $PGDATABASE, your_backup_file.sql) with actual values.
