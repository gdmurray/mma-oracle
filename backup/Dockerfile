FROM alpine:latest

# Install PostgreSQL client, MongoDB Tools, AWS CLI, and cron
RUN apk update && \
    apk add --no-cache postgresql-client mongodb-tools aws-cli \
    busybox-extras && \
    rm -rf /var/cache/apk/*


# Add your backup scripts
COPY backup_postgres.sh /backup_postgres.sh
COPY backup_mongo.sh /backup_mongo.sh

# Make the scripts executable
RUN chmod +x /backup_postgres.sh /backup_mongo.sh

# Setup cron jobs
RUN echo "0 */6 * * * /backup_postgres.sh" >> /etc/crontabs/root
RUN echo "0 */6 * * * /backup_mongo.sh" >> /etc/crontabs/root


# (Optional) Set default AWS region via environment variable
# It's better to pass AWS credentials at runtime for security
ENV AWS_DEFAULT_REGION=wnam
ENV S3_BUCKET=mma-oracle

# Run cron in foreground
CMD ["crond", "-f", "-d", "8"]
