defmodule Backend.Leagues.League do
  use Ecto.Schema
  import Ecto.Changeset

  schema "league" do
    field :name, :string
    field :description, :string

    many_to_many :members, Backend.Accounts.User, join_through: "users_leagues"
    belongs_to :admin, Backend.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(league, attrs) do
    league
    |> cast(attrs, [])
    |> validate_required([])
  end
end
