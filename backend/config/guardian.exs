config :backend, Backend.Guardian,
       issuer: "backend",
       secret_key: System.get_env("GUARDIAN_SECRET_KEY")
