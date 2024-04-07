# Secure Requests with Elixir to Google Cloud

### Step 1: Create a Service Account in Google Cloud

Go to the Google Cloud Console → IAM & Admin → Service Accounts.
Create a new service account with minimal necessary permissions. For calling a Cloud Run service, typically assigning the roles/run.invoker role is sufficient.
Create and download a JSON key for this service account.
### Step 2: Secure Your Cloud Run Service
Ensure your Cloud Run service is set to require authentication:

When deploying your service, use the --no-allow-unauthenticated flag, or set the service to require authentication through the console.
 
### Step 3: Authenticate Your Requests from Elixir

On your Elixir Phoenix server, you'll need to obtain an OAuth 2.0 token for your service account and include this token in the Authorization header of your requests to the Cloud Run service.

#### Install Dependencies
You might need an HTTP client and a library to handle JSON. If you're not already using them, HTTPoison and Jason are good choices:


```elixir
defp deps do
    [
        {:httpoison, "~> 1.8"},
        {:jason, "~> 1.2"}
    ]
end
```

### Implement Authentication
Load the Service Account Credentials: Load the service account JSON key you downloaded.

Obtain an OAuth 2.0 Token: Google’s OAuth 2.0 endpoint for obtaining tokens is https://oauth2.googleapis.com/token. You need to exchange your service account credentials for a token.

Call the Cloud Run API: Use the obtained token in the Authorization header as a Bearer token.

```elixir
defmodule GoogleAuth do
@token_url "https://oauth2.googleapis.com/token"

def get_access_token do
service_account = Jason.decode!(File.read!("path/to/your/service-account-file.json"))

    payload = %{
      "grant_type" => "urn:ietf:params:oauth:grant-type:jwt-bearer",
      "assertion" => jwt_assertion(service_account)
    }

    headers = ["Content-Type": "application/x-www-form-urlencoded"]
    response = HTTPoison.post!(@token_url, URI.encode_query(payload), headers)

    case Jason.decode(response.body) do
      {:ok, %{"access_token" => token}} -> token
      _error -> raise "Failed to obtain access token"
    end
end

defp jwt_assertion(service_account) do
# Implement JWT creation using the service account credentials.
# This involves creating a signed JWT asserting your identity to Google's OAuth server.
# You can use a library like `joken` to generate JWTs in Elixir.
# Note: This step is complex, as it involves creating a properly signed JWT
#       that Google's OAuth endpoint will accept.
end
end
```

Using the Access Token: Once you have the access token, you can make authenticated requests to your Cloud Run service.

```elixir
defmodule CloudRunClient do
    def call_secured_api do
        token = GoogleAuth.get_access_token()
        url = "YOUR_CLOUD_RUN_SERVICE_URL"
        
        headers = ["Authorization": "Bearer #{token}"]
        response = HTTPoison.get!(url, headers)
            
        case response.status_code do
          200 -> {:ok, response.body}
          _ -> {:error, response.body}
        end
    end
end
```






