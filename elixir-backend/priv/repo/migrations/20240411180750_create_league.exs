defmodule Backend.Repo.Migrations.CreateLeague do
  use Ecto.Migration

  def change do
    create table(:league) do
      add :name, :string
      add :description, :string
      add :admin_id, references(:users, on_delete: :delete_all)

      timestamps(type: :utc_datetime)
    end

    create index(:league, [:admin_id])
  end
end
