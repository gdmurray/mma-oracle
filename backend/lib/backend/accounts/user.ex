defmodule Backend.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :username, :string
    field :email, :string
    field :device_id, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :device_id, :username, :name])
    |> validate_required([:email, :device_id, :username, :name])
    |> unique_constraint(:email)
    |> unique_constraint(:username)
  end
end
