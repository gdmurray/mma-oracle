defmodule Backend.Repo.Migrations.AddRankToUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :rank, :integer, default: 0
      add :rank_points, :integer, default: 0
    end

    create index(:users, [:rank])
  end
end
