defmodule BackendWeb.ProviderAuthController do
  use BackendWeb, :controller
  alias Backend.Accounts
  plug Ueberauth
  require Logger

  def request(conn, %{"provider" => "google"}) do
    Ueberauth.Strategy.run_request("google", conn)
  end

  # Handle initial pre-auth request
  def pre_request(conn, %{"provider" => provider}) do
    IO.inspect(conn.params, label: "PRE REQUEST Params")
    device_id = conn.params["device_id"]
    redirect_uri = conn.params["redirect_uri"]
    conn = put_session(conn, :device_id, device_id)
    conn = put_session(conn, :redirect_uri, redirect_uri)
    # Redirect to the standard Ueberauth request route
    redirect(conn, to: "/auth/#{provider}")
  end

  def callback(%{assigns: %{ueberauth_auth: auth}} = conn, params) do
    IO.inspect(conn, label: "Callback Conn")
    IO.inspect(auth, label: "Callback Auth")
    IO.inspect(params, label: "CALLBACK Params")
    # Retrieve any needed data from session or state
    device_id = get_session(conn, :device_id)
    base_redirect = get_session(conn, :redirect_uri)
    decoded_device_id = Base.url_decode64!(device_id)
    IO.inspect(decoded_device_id, label: "DECODED DEVICE ID from session")
    auth_params = extract_auth_params(auth)
    user_params = extract_user_params(auth, decoded_device_id)
    IO.inspect(auth_params, label: "OAuth Callback Parsed Auth Params")
    IO.inspect(user_params, label: "Parsed User Params")

    case Accounts.get_user_by_provider(auth_params.provider, auth_params.uid) do
      nil ->
        # No user associated with this credential, create user and credential
        Logger.info("User Does not Exist, creating user")

        with {:ok, user} <- Accounts.create_user(user_params),
             {:ok, _credential} <- Accounts.create_credential(user, auth_params) do
          {:ok,
           %{
             access_token: access_token,
             access_token_expires_at: access_token_expires_at,
             refresh_token: refresh_token,
             refresh_token_expires_at: refresh_token_expires_at
           }} = Accounts.issue_tokens(user)

          redirect_uri =
            "#{base_redirect}?access_token=#{access_token}&access_token_expiry=#{access_token_expires_at}&refresh_token=#{refresh_token}&refresh_token_expiry=#{refresh_token_expires_at}"

          Logger.info("Redirecting to: #{redirect_uri}")
          redirect(conn, external: redirect_uri)
        else
          {:error, changeset} ->
            Logger.info("Failed to create user: #{inspect(changeset.errors)}")
            text(conn, "Failed to authenticate")
        end

      user ->
        # User exists, update credentials and sign in the user
        Logger.info("User exists, updating credentials")

        with {:ok, _credential} <- Accounts.upsert_credential(user, auth_params) do
           %{
             access_token: access_token,
             access_token_expires_at: access_token_expires_at,
             refresh_token: refresh_token,
             refresh_token_expires_at: refresh_token_expires_at
           } = Accounts.issue_tokens(user)

          redirect_uri =
            "#{base_redirect}?access_token=#{access_token}&access_token_expiry=#{access_token_expires_at}&refresh_token=#{refresh_token}&refresh_token_expiry=#{refresh_token_expires_at}"

          Logger.info("Redirecting to: #{redirect_uri}")
          redirect(conn, external: redirect_uri)
        end
    end
  end

  defp extract_auth_params(auth) do
    %{
      uid: auth.uid,
      provider: Atom.to_string(auth.provider),
      token: auth.credentials.token,
      refresh_token: auth.credentials.refresh_token,
      token_expiry:
        parse_token_expiry(
          auth.credentials.expires_at && DateTime.from_unix(auth.credentials.expires_at)
        ),
      info: Map.take(auth.info, [:email, :name, :image])
      # Add other fields you want to extract from the auth struct
    }
  end

  defp parse_token_expiry({:ok, datetime}), do: datetime
  defp parse_token_expiry(datetime) when is_binary(datetime), do: DateTime.from_iso8601(datetime)
  # or handle as needed
  defp parse_token_expiry(_), do: nil

  defp extract_user_params(auth, device_id) do
    %{
      email: auth.info.email,
      name: auth.info.name,
      device_id: device_id
    }
  end

  def failure(conn, params) do
    Logger.error(conn)
    Logger.error(params)
    # handle the failure in an appropriate way (e.g., redirecting to the login page)
  end
end
