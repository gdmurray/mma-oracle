defmodule Backend.Guardian do
  use Guardian, otp_app: :backend

  def subject_for_token(user, _claims) do
    # Use the resource's ID as the subject
    {:ok, "User:#{user.id}"}
  end

  def resource_from_claims(claims) do
    "User:" <> id = claims["sub"]

    case Backend.Accounts.get_user(id) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end
end
