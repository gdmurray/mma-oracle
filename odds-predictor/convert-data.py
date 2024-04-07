import pandas as pd


# Function to convert American odds to Decimal odds
def american_to_decimal(american_odds):
    if american_odds > 0:
        return (american_odds / 100) + 1
    else:
        return (100 / abs(american_odds)) + 1


# Load the CSV file
df = pd.read_csv('./data/training-data.csv')

# Check if the specified columns exist in the DataFrame to avoid KeyError
if "F1 ML" in df.columns and "F2 ML" in df.columns:
    # Apply the conversion function to the "F1 ML" and "F2 ML" columns
    # Use .apply() with a lambda function to handle conversion for each value
    df['F1 ML'] = df['F1 ML'].apply(lambda x: american_to_decimal(x))
    df['F2 ML'] = df['F2 ML'].apply(lambda x: american_to_decimal(x))
else:
    print("One of the specified columns does not exist in the DataFrame.")

# Save the modified DataFrame back to a new CSV file
df.to_csv('./data/training-data.csv', index=False)
