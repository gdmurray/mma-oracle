FROM alpine:latest

# Install PostgreSQL client, MongoDB Tools, AWS CLI, and cron
RUN apk update && \
    apk add --no-cache postgresql-client mongodb-tools aws-cli \
    busybox-extras openssh-server && \
    rm -rf /var/cache/apk/*


# Add your backup scripts
COPY backup_postgres.sh /backup_postgres.sh
COPY backup_mongo.sh /backup_mongo.sh

# Make the scripts executable
RUN chmod +x /backup_postgres.sh /backup_mongo.sh

# Setup cron jobs
RUN echo "0 */6 * * * /backup_postgres.sh" >> /etc/crontabs/root
RUN echo "0 */6 * * * /backup_mongo.sh" >> /etc/crontabs/root

# Setup SSH server
RUN echo "root:DockerBackup!" | chpasswd
RUN ssh-keygen -A
EXPOSE 22


# (Optional) Set default AWS region via environment variable
# It's better to pass AWS credentials at runtime for security
ENV AWS_DEFAULT_REGION=us-west-2
ENV S3_BUCKET=mma-oracle

# Run cron in foreground
CMD ["crond", "-f", "-d", "8"]
