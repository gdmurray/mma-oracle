defmodule Backend.Repo.Migrations.CreateRankChanges do
  use Ecto.Migration

  def change do
    create table(:rank_changes) do
      add :user_id, references(:users, on_delete: :delete_all)
      add :points, :integer
      add :points_change, :integer
      add :percentile, :integer
      add :rank, :integer
      timestamps(type: :utc_datetime)
    end
  end
end
