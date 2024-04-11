defmodule Backend.Guardian do
  use Guardian, otp_app: :backend

  def subject_for_token(user, _claims) do
    # Use the resource's ID as the subject
    {:ok, "User:#{user.id}"}
  end

  def resource_from_claims(claims) do
    # Find the user from the claims
    id = claims["sub"] |> String.split(":") |> List.last() |> String.to_integer()
    user = Backend.Accounts.get_user!(id)
    {:ok, user}
  end
end
