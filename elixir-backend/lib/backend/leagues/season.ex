defmodule Backend.Leagues.Season do
  use Ecto.Schema
  import Ecto.Changeset

  schema "season" do
    field :name, :string
    field :description, :string
    field :start_date, :utc_datetime
    field :end_date, :utc_datetime

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(season, attrs) do
    season
    |> cast(attrs, [])
    |> validate_required([])
  end
end
