import pandas as pd
from joblib import load
import json

# File path to your JSON file
file_path = './data/6435.json'


# Function to prepare new data
def prepare_new_data(new_df, training_features):
    # Remove the first 5 columns
    new_df = new_df.iloc[:, 5:]

    # Extract labels and then drop it from new_df to get features
    labels = new_df.iloc[:, 0]  # This is your 'Label' column now
    new_df = new_df.drop(new_df.columns[0], axis=1)

    # One-hot encode the labels to match the training data
    labels_encoded = pd.get_dummies(labels)

    # Combine encoded labels with the rest of the features
    x_new = pd.concat([new_df, labels_encoded], axis=1)

    # Add missing dummy columns in X_new
    for col in training_features:
        if col not in x_new.columns:
            x_new[col] = 0

    # Ensure the order of columns matches the training data
    x_new = x_new[training_features]

    return x_new


def decimal_to_american(decimal_odds):
    if decimal_odds >= 2.0:
        # Positive American odds
        american_odds = (decimal_odds - 1) * 100
    else:
        # Negative American odds
        american_odds = -100 / (decimal_odds - 1)

    # Round the result to avoid decimal points in American odds
    american_odds = round(american_odds)

    # Format as string with + for positive odds
    if american_odds > 0:
        return f'+{american_odds}'
    else:
        return str(american_odds)


label_map = {
    "FighterOneByTKO": "To Win By KO/TKO/DQ",
    "FighterTwoByTKO": "To Win By KO/TKO/DQ",
    "FighterOneByDecision": "To Win By Decision",
    "FighterTwoByDecision": "To Win By Decision",
    "FighterOneBySubmission": "To Win By Submission",
    "FighterTwoBySubmission": "To Win By Submission",
}


def fix_name(name):
    overrides = {
        "Chepe Mariscal": "Jose Mariscal",
    }
    if name in overrides:
        return overrides[name]
    return name
    # return unidecode(name)


# Main execution flow
if __name__ == "__main__":
    # Load the trained model
    model = load('predictions_model.joblib')
    best_model = load("best_predictions_model.joblib")

    # Load the new dataset
    df = pd.read_csv('./data/testing-data.csv')

    rows_as_dicts = df.to_dict('records')

    # Example loading training features from a file (adjust as needed)
    # Assume you've saved the training feature names to a file during model training
    feature_names = pd.read_csv('training_feature_names.csv')['feature_names'].tolist()

    # Prepare the new data
    X_new_prepared = prepare_new_data(df, feature_names)

    offers_map = {}
    with open(file_path, "r") as file:
        data = json.load(file)
        category = next(
            (element for element in data["eventGroup"]["offerCategories"] if element["offerCategoryId"] == 726), None)
        if category is not None:
            subcategory = next(
                (element for element in category["offerSubcategoryDescriptors"] if element["subcategoryId"] == 6435),
                None)
            if subcategory is not None:
                offers = subcategory["offerSubcategory"]["offers"]
                for offer in offers:
                    outcomes = [{"label": outcome["label"], "odds": outcome["oddsAmerican"]} for outcome in
                                offer[0]["outcomes"] if "To Win By" in outcome["label"]]
                    for outcome in outcomes:
                        offers_map[outcome["label"]] = outcome["odds"]

                for i in range(len(rows_as_dicts)):
                    fighter = rows_as_dicts[i]["Fighter One"]
                    method = rows_as_dicts[i]["Label"]

    print("Offer Map: ", offers_map)
    # Making predictions
    new_predictions = model.predict(X_new_prepared)
    best_predictions = best_model.predict(X_new_prepared)
    table_arr = []
    for i in range(len(rows_as_dicts)):
        fighter = rows_as_dicts[i]["Fighter One"]
        method = rows_as_dicts[i]["Label"]
        offer_lookup = f"{fix_name(fighter)} {label_map[method]}"
        new_prediction_string = decimal_to_american(new_predictions[i])
        best_prediction_string = decimal_to_american(best_predictions[i])
        row_data = [rows_as_dicts[i]["Winner and Method"], new_prediction_string,
                    best_prediction_string]

        if offer_lookup in offers_map:
            row_data.append(offers_map[offer_lookup])
            row_data.extend([abs(int(offers_map[offer_lookup]) - int(new_prediction_string)),
                             abs(int(offers_map[offer_lookup]) - int(best_prediction_string))])
        else:
            row_data.extend(["N/A", "N/A", "N/A"])
        table_arr.append(row_data)

    base_average_rows = [col[4] for col in table_arr if col[4] != "N/A"]
    tuned_average_rows = [col[5] for col in table_arr if col[5] != "N/A"]
    table_arr.append(
        ["Average Difference", "-", "-", "-",
         str(round(sum(base_average_rows) / len(base_average_rows), 2)),
         str(round(sum(tuned_average_rows) / len(tuned_average_rows), 2))
         ]
    )
    # print(tabulate(table_arr, headers=[
    # "Winner and Method",
    # "Base Model",
    # "Tuned Model",
    # "Draftking Odds",
    # "Base Diff",
    # "Tuned Diff"]))
    # for i in range(len(rows_as_dicts)):
    #     print(f"{rows_as_dicts[i]["Winner and Method"]}: ")
    #     print(f"Base Model: {decimal_to_american(new_predictions[i])}")
    #     print(f"Hypertuned Model: {decimal_to_american(best_predictions[i])}")
    #     print("\n")
