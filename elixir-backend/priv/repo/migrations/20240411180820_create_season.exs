defmodule Backend.Repo.Migrations.CreateSeason do
  use Ecto.Migration

  def change do
    create table(:season) do
      add :name, :string
      add :description, :string
      add :start_date, :utc_datetime
      add :end_date, :utc_datetime
      timestamps(type: :utc_datetime)
    end
  end
end
