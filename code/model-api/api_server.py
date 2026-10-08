from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    # In a real scenario, we would load loan_model.pkl and predict based on features
    # like income, cibilScore, hospitalBillAmount, existingEMI, etc.
    # For MVP mock, we generate a rule-based/randomized score based on input.
    
    income = float(data.get('applicantIncome', 50000))
    credit_history = float(data.get('creditHistory', 1))
    loan_amount = float(data.get('loanAmount', 100000))
    
    # Simple logic
    base_score = 50
    if credit_history == 1: base_score += 20
    else: base_score -= 20
    
    if income * 10 > loan_amount: base_score += 20
    else: base_score -= 10
    
    # Add some randomness for the mock ML model
    score = min(max(base_score + random.randint(-5, 10), 10), 99)
    approved = score > 60
    
    return jsonify({
        'approved': approved,
        'score': score,
        'max_loan_amount': min(loan_amount, income * 10) if approved else 0,
        'interest_rate': 10.5 if credit_history == 1 else 14.5 if approved else None,
        'reason': 'Approved based on ML model' if approved else 'High risk profile'
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
