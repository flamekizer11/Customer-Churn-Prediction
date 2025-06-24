from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd
import numpy as np
from preprocessing import preprocess

app = Flask(__name__)

# Load the trained model
try:
    with open('notebook/model.pkl', 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    model = None
    print("Model file not found. Please ensure model.pkl exists.")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get form data with default values
        data = {
            'gender': request.form.get('gender', ''),
            'senior_citizen': int(request.form.get('senior_citizen', 0)),
            'partner': request.form.get('partner', ''),
            'dependents': request.form.get('dependents', ''),
            'tenure': int(request.form.get('tenure', 0)),
            'phone_service': request.form.get('phone_service', ''),
            'multiple_lines': request.form.get('multiple_lines', ''),
            'internet_service': request.form.get('internet_service', ''),
            'online_security': request.form.get('online_security', ''),
            'online_backup': request.form.get('online_backup', ''),
            'device_protection': request.form.get('device_protection', ''),
            'tech_support': request.form.get('tech_support', ''),
            'streaming_tv': request.form.get('streaming_tv', ''),
            'streaming_movies': request.form.get('streaming_movies', ''),
            'contract': request.form.get('contract', ''),
            'paperless_billing': request.form.get('paperless_billing', ''),
            'payment_method': request.form.get('payment_method', ''),
            'monthly_charges': float(request.form.get('monthly_charges', 0.0)),
            'total_charges': float(request.form.get('total_charges', 0.0))
        }
        
        # Converting to dataframe and preprocessing the data
        df = pd.DataFrame([data])
        processed_data = preprocess(df, "Online")
        
        # Make prediction
        if model:
            prediction = model.predict(processed_data)[0]
            probability = model.predict_proba(processed_data)[0]
            
            result = {
                'prediction': 'Churn' if prediction == 1 else 'No Churn',
                'probability': {
                    'no_churn': round(probability[0] * 100, 2),
                    'churn': round(probability[1] * 100, 2)
                }
            }
        else:
            result = {'error': 'Model not loaded'}
        
        # Ensure all keys exist in result and data for template
        if 'error' not in result:
            result.setdefault('prediction', '')
            result.setdefault('probability', {})
            result['probability'].setdefault('no_churn', 0)
            result['probability'].setdefault('churn', 0)
        data.setdefault('gender', '')
        data.setdefault('senior_citizen', 0)
        data.setdefault('partner', '')
        data.setdefault('dependents', '')
        data.setdefault('tenure', 0)
        data.setdefault('phone_service', '')
        data.setdefault('multiple_lines', '')
        data.setdefault('internet_service', '')
        data.setdefault('online_security', '')
        data.setdefault('online_backup', '')
        data.setdefault('device_protection', '')
        data.setdefault('tech_support', '')
        data.setdefault('streaming_tv', '')
        data.setdefault('streaming_movies', '')
        data.setdefault('contract', '')
        data.setdefault('paperless_billing', '')
        data.setdefault('payment_method', '')
        data.setdefault('monthly_charges', 0.0)
        data.setdefault('total_charges', 0.0)
            
        return render_template('result.html', result=result, data=data)
        
    except Exception as e:
        return render_template('result.html', result={'error': str(e)}, data={})

@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        # Get JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        # Convert to DataFrame
        df = pd.DataFrame([data])

        # Preprocess the data
        processed_data = preprocess(df, "Online")

        # Make prediction
        if model:
            prediction = model.predict(processed_data)[0]
            probas = model.predict_proba(processed_data)[0]

            # Defensive unpacking
            no_churn = float(probas[0]) if len(probas) > 0 else 0.0
            churn = float(probas[1]) if len(probas) > 1 else 0.0

            return jsonify({
                'prediction': int(prediction),
                'probability': {
                    'no_churn': no_churn,
                    'churn': churn
                }
            })
        else:
            return jsonify({'error': 'Model not loaded'}), 500
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)
