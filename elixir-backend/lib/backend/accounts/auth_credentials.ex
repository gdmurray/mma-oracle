defmodule Backend.Accounts.AuthCredentials do
  use Ecto.Schema
  import Ecto.Changeset

  schema "auth_credentials" do
    field :provider, :string
    field :uid, :string
    field :token, :string
    field :refresh_token, :string
    field :token_expiry, :utc_datetime

    belongs_to :user, Backend.Accounts.User

    timestamps()
  end

  @doc false
  def changeset(auth_credentials, attrs) do
    auth_credentials
    |> cast(attrs, [:provider, :uid, :token, :refresh_token, :token_expiry, :user_id])
    |> validate_required([:provider, :uid, :user_id])

    # Add any custom validation here
  end
end
