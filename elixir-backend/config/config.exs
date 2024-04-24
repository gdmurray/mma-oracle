# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :backend,
  ecto_repos: [Backend.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :backend, BackendWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: BackendWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Backend.PubSub,
  live_view: [signing_salt: "i2wPYSwK"]

config :backend, Backend.Guardian,
  issuer: "backend",
  secret_key: System.get_env("GUARDIAN_SECRET_KEY") || "some_secret_key"

config :ueberauth, Ueberauth.Strategy.Google.Oauth,
  default_scope: "email profile",
  redirect_uri: "http://localhost:4000/auth/google/callback",
  client_id: System.get_env("GOOGLE_CLIENT_ID"),
  client_secret: System.get_env("GOOGLE_CLIENT_SECRET"),
  access_type: "offline",
  prompt: "consent"

config :ueberauth, Ueberauth,
  providers: [
    google:
      {Ueberauth.Strategy.Google,
       [
         client_id: System.get_env("GOOGLE_CLIENT_ID"),
         client_secret: System.get_env("GOOGLE_CLIENT_SECRET"),
         access_type: "offline",
         prompt: "consent"
       ]},
    apple: {Ueberauth.Strategy.Apple, []}
    # Add other providers here
  ]

config :backend, :oauth_providers,
  google: %{
    module: GoogleProvider,
    client_id: System.get_env("GOOGLE_CLIENT_ID"),
    client_secret: System.get_env("GOOGLE_CLIENT_SECRET"),
    site: "https://accounts.google.com",
    token_url: "/o/oauth2/token",
    refresh_url: "/o/oauth2/refresh",
    redirect_uri: "http://localhost:4000/auth/google/callback"
  },
  apple: %{
    module: AppleProvider,
    # System.get_env("APPLE_CLIENT_ID"),
    client_id: "",
    # System.get_env("APPLE_CLIENT_SECRET"),
    client_secret: "",
    site: "https://appleid.apple.com",
    token_url: "/auth/token",
    refresh_url: "/auth/refresh",
    redirect_uri: "http://localhost:4000/auth/apple/callback"
  }

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :backend, Backend.Mailer, adapter: Swoosh.Adapters.Local

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
