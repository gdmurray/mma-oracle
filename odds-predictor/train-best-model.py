import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error
from joblib import dump

model_path = "models/best_predictions_model.joblib"
# Load the dataset
df = pd.read_csv('./data/training-data.csv')


# Function to save feature names
def save_feature_names(X_train, filename='training_feature_names.csv'):
    feature_names_df = pd.DataFrame(X_train.columns, columns=['feature_names'])
    feature_names_df.to_csv(filename, index=False)


# Preprocess the DataFrame
df = df.iloc[:, 5:-1]  # Drop the first 5 columns and the last column
X = pd.get_dummies(df.drop('Odds Dec', axis=1), columns=['Label'])  # One-hot encoding
y = df['Odds Dec']

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Save the feature names
save_feature_names(X_train)

# Set up the parameter grid for hyperparameter tuning
param_grid = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.01, 0.1, 0.2],
    'max_depth': [3, 4, 5],
    'min_samples_split': [2, 3],
    'min_samples_leaf': [1, 2, 3]
}

# Initialize the GridSearchCV object
grid_search = GridSearchCV(GradientBoostingRegressor(random_state=42), param_grid, cv=5,
                           scoring='neg_mean_squared_error', n_jobs=-1)

# Perform grid search and cross-validation
grid_search.fit(X_train, y_train)

# Get the best estimator
best_model = grid_search.best_estimator_

# Make predictions with the best model
y_pred = best_model.predict(X_test)

# Evaluate the best model
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')
print(f'Best parameters: {grid_search.best_params_}')

# Save the best model
dump(best_model, model_path)
