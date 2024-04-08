# Use an official Elixir runtime as a parent image
FROM elixir:otp-25-alpine

# Set the working directory in the container
WORKDIR /app

# Fix bug https://github.com/erlang/otp/issues/8238
#RUN mix archive.install github hexpm/hex branch latest

# Install hex package manager
RUN mix local.hex --force

# Install the latest Phoenix
RUN mix archive.install hex phx_new  --force

# Install rebar
RUN mix local.rebar --force

# Copy the app contents into the container at /app
COPY ./ /app

# Install dependencies
RUN mix deps.get

# Compile the project
RUN mix do compile

CMD ["/app/entrypoint.sh"]
