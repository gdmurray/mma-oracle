defmodule BackendWeb.AuthController do
  use BackendWeb, :controller
  alias Backend.Accounts
  require Logger

  # Issue new tokens
  def login(conn, %{"user_id" => user_id}) do
    case Accounts.get_user(user_id) do
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "User not found"})

      user ->
        tokens = Accounts.issue_tokens(user)

        conn
        |> put_status(:ok)
        |> json(tokens)
    end
  end

  # Refresh token endpoint
  # TODO: Fix the refresh token logic
  def refresh(conn, %{"refresh_token" => refresh_token}) do
    case Accounts.refresh_access_token(refresh_token) do
      {:ok, new_access_token, new_refresh_token} ->
        conn
        |> json(%{
          access_token: new_access_token.token,
          refresh_token: new_refresh_token.token,
          expires_in: new_access_token.expires_at,
          token_type: new_access_token.token_type
        })

      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: reason})
    end
  end

  # Logout or token revoke
  def logout(conn, _params) do
    # You can add token invalidation logic here if you are storing tokens or sessions
    conn
    |> put_flash(:info, "Logged out successfully.")
    |> redirect(to: "/")
  end

  defp put_secure_browser_headers(conn, _) do
    conn
    |> put_resp_header("cache-control", "no-store, max-age=0")
    |> put_resp_header("pragma", "no-cache")
  end
end
