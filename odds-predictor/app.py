import json
import os

from flask import Flask, request, jsonify
from joblib import load
import pandas as pd
import logging

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load your trained model (ensure the model file is in your project directory or provide the full path)
model = load('models/predictions_model.joblib')
training_features = pd.read_csv('training_feature_names.csv')['feature_names'].tolist()


# Error handling
@app.errorhandler(404)
def not_found(error):
    app.logger.error(error)
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    app.logger.error(error)
    return jsonify({'error': 'Internal server error'}), 500


def prepare_data(input_data):
    # Convert the input data to a DataFrame
    df = pd.DataFrame(input_data)

    # One-hot encode the 'Label' column
    df_encoded = pd.get_dummies(df, columns=['Label'])

    # Ensure df_encoded has all the columns from the training data, filling missing ones with 0
    for col in training_features:
        if col not in df_encoded.columns:
            df_encoded[col] = 0

    # Reorder columns to match the training data
    df_encoded = df_encoded.reindex(columns=training_features, fill_value=0)

    return df_encoded


@app.route('/api/predict', methods=['POST', 'GET'])
def predict():
    # Get JSON data from the POST request
    data = request.json
    app.logger.info("Received Predict Request %s ", json.dumps(data))

    # Check if data is not None and is a list
    if data and isinstance(data, list):
        # Prepare the new data
        x_new_prepared = prepare_data(data)

        # Predict
        prediction = model.predict(x_new_prepared)
        app.logger.info("Prediction: %s", json.dumps(prediction))
        prediction_list = prediction.tolist()
        prediction_obj = {}
        for i in range(len(prediction_list)):
            prediction_obj[data[i]['Label']] = prediction_list[i]

        # Return the prediction as a JSON response
        return jsonify({'odds': prediction_obj})
    else:
        return jsonify({'error': 'Invalid input data'}), 400


if __name__ == '__main__':
    if os.environ.get('FLASK_ENV', "development").lower() == 'production':
        app.run(debug=False, host='0.0.0.0')
    else:
        app.run(debug=True, port=5555)
