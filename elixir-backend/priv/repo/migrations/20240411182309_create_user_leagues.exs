defmodule Backend.Repo.Migrations.CreateUsersLeagues do
  use Ecto.Migration

  def change do
    create table(:users_leagues) do
      add :user_id, references(:users, on_delete: :delete_all)
      add :league_id, references(:league, on_delete: :delete_all)
    end

    # This index ensures that a user cannot join the same league more than once
    create unique_index(:users_leagues, [:user_id, :league_id])

    # You may also want to index these columns individually to speed up queries
    create index(:users_leagues, [:user_id])
    create index(:users_leagues, [:league_id])
  end
end
