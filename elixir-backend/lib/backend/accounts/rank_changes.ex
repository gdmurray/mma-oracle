defmodule Backend.Accounts.RankChanges do
  use Ecto.Schema
  import Ecto.Changeset

  schema "rank_changes" do
    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(rank_changes, attrs) do
    rank_changes
    |> cast(attrs, [])
    |> validate_required([])
  end
end
