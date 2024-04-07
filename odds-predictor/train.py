import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error
from joblib import dump

# Load the dataset
df = pd.read_csv('./data/training-data.csv')
model_path = "models/predictions_model.joblib"


def save_feature_names(Xtr, filename='training_feature_names.csv'):
    """Save the feature names to a CSV file."""
    # Convert the column names from X_train to a DataFrame
    feature_names_df = pd.DataFrame(Xtr.columns, columns=['feature_names'])
    # Save to CSV
    feature_names_df.to_csv(filename, index=False)


# Drop the first 5 columns and the last column
df = df.iloc[:, 5:-1]

print("Df: ", df)

# Assuming "Label" is now the first column in the modified DataFrame and "Odds Dec" is the last
X = pd.get_dummies(df.drop('Odds Dec', axis=1), columns=['Label'])  # Convert 'Label' to one-hot encoding
y = df['Odds Dec']  # Target variable for regression

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

save_feature_names(X_train)
# Initialize the Gradient Boosting Regressor
model = GradientBoostingRegressor(random_state=42)

# Train the model
model.fit(X_train, y_train)

# Make predictions on the test set
y_pred = model.predict(X_test)

# Evaluate the model using Mean Squared Error (MSE)
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')

dump(model, model_path)
