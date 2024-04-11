defmodule Backend.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :email, :string
      add :device_id, :string
      add :username, :string
      add :name, :string

      timestamps(type: :utc_datetime)
    end
    create unique_index(:users, [:email])
    create unique_index(:users, [:username])
  end
end
