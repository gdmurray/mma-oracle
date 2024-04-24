defmodule Backend.Accounts do
  alias Backend.Repo
  alias Backend.Accounts.User
  alias Backend.Accounts.AuthCredentials

  # Get user by provider and UID
  def get_user_by_provider(provider, uid) do
    IO.inspect(provider, label: "Provider")
    IO.inspect(uid, label: "UID")

    Repo.get_by(AuthCredentials, provider: provider, uid: uid)
    |> case do
      nil -> nil
      credential -> Repo.preload(credential, :user).user
    end
  end

  # Create user
  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Gets a user by ID.
  """
  def get_user(id) do
    Repo.get(User, id)
  end

  # Create credential
  def create_credential(user, attrs) do
    %AuthCredentials{user_id: user.id}
    |> AuthCredentials.changeset(attrs)
    |> Repo.insert()
  end

  # Upsert credential
  def upsert_credential(user, attrs) do
    credential =
      Repo.get_by(AuthCredentials, user_id: user.id, provider: attrs.provider)
      |> case do
        nil -> %AuthCredentials{user_id: user.id}
        existing_credential -> existing_credential
      end

    credential
    |> AuthCredentials.changeset(attrs)
    |> Repo.insert_or_update()
  end

#  defp update_credentials(access_token, expires_at, refresh_token) do
#    AuthCredentials
#    |> Repo.get_by(refresh_token: refresh_token)
#    |> case do
#      nil ->
#        {:error, :not_found}
#
#      credential ->
#        credential
#        |> AuthCredentials.changeset(%{token: access_token, token_expiry: expires_at})
#        |> Repo.update()
#    end
#  end

  def issue_tokens(user) do
    # Current time
    current_time = DateTime.utc_now()

    # Calculate access token expiry time
    # 6 hours from now
    access_token_expires_at = DateTime.add(current_time, 6 * 60 * 60)
    access_token_expiry_timestamp = DateTime.to_unix(access_token_expires_at)

    # Calculate refresh token expiry time
    # 30 days from now
    refresh_token_expires_at = DateTime.add(current_time, 30 * 24 * 60 * 60)
    refresh_token_expiry_timestamp = DateTime.to_unix(refresh_token_expires_at)

    # Access token (short-lived)
    {:ok, access_token, _} = Backend.Guardian.encode_and_sign(user, %{}, ttl: {6, :hours})
    # Refresh token (long-lived)
    {:ok, refresh_token, _} =
      Backend.Guardian.encode_and_sign(user, %{"typ" => "refresh"}, ttl: {30, :days})

    # Return tokens along with their expiry timestamps
    %{
      access_token: access_token,
      access_token_expires_at: access_token_expiry_timestamp,
      refresh_token: refresh_token,
      refresh_token_expires_at: refresh_token_expiry_timestamp
    }
  end

  def refresh_access_token(refresh_token) do
    case Backend.Guardian.decode_and_verify(refresh_token, %{"typ" => "refresh"}) do
      {:ok, claims} ->
        current_time = DateTime.utc_now()
        refresh_token_expires_at = claims["exp"] |> DateTime.from_unix!()

        # Determine if the refresh token needs renewal
        days_until_expiry = DateTime.diff(refresh_token_expires_at, current_time, :day)

        new_refresh_token =
          if days_until_expiry < 7 do
            {:ok, new_token, _} =
              Backend.Guardian.encode_and_sign(
                Backend.Guardian.resource_from_claims(claims),
                %{"typ" => "refresh"},
                ttl: {30, :days}
              )

            new_token
          else
            refresh_token
          end

          # TODO: Confirm that this works for expires_at and expires
        {:ok, %OAuth2.AccessToken{} = new_access_token} =
          Backend.Guardian.encode_and_sign(Backend.Guardian.resource_from_claims(claims), %{},
            ttl: {6, :hours}
          )

        {:ok, new_access_token, new_refresh_token}

      {:error, _} ->
        {:error, "Invalid or expired refresh token"}
    end
  end
end
