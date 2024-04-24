defmodule Backend.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :username, :string
    field :email, :string
    field :device_id, :string
    field :rank, :integer, default: 0
    field :rank_points, :integer, default: 0

    has_many :auth_credentials, Backend.Accounts.AuthCredentials

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :device_id, :username, :name])
    |> validate_required([:email])
    |> unique_constraint(:email)
    |> unique_constraint(:username)
  end
end
