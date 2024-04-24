defmodule Backend.Repo.Migrations.CreateUserAuthCredentials do
  use Ecto.Migration

  def change do
    create table(:auth_credentials) do
      add :user_id, references(:users, on_delete: :delete_all)
      add :provider, :string
      add :uid, :string
      add :token, :string

      add :refresh_token, :string
      add :token_expiry, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:auth_credentials, [:user_id])
    create unique_index(:auth_credentials, [:uid, :provider])
  end
end
