import sys
import joblib
import json
import pandas as pd
from textblob import TextBlob
from datetime import datetime

# Load models and binarizers
tag_model = joblib.load('tag_predictor_model.pkl')
mlb = joblib.load('tag_binarizer.pkl')
time_model = joblib.load('answer_time_predictor.pkl')
quality_model = joblib.load('question_quality_model.pkl')

def preprocess_text(question):
    return question.lower()

def predict_tags(question):
    processed_question = preprocess_text(question)
    tags_pred = tag_model.predict([processed_question])
    tags = mlb.inverse_transform(tags_pred)
    tags_list = [tag for sublist in tags for tag in sublist]
    return tags_list

def predict_answer_time(question_length, tags_count):
    input_data = pd.DataFrame([[question_length, tags_count]], columns=['question_length', 'tags_count'])
    predicted_time = time_model.predict(input_data)[0]
    return predicted_time

def predict_question_quality(question):
    # Prediction logic for question quality
    # Assuming the current datetime for prediction
    creation_date = datetime.now()
    text_length = len(question)
    sentiment = TextBlob(question).sentiment.polarity
    hour_of_day = creation_date.hour
    day_of_week = creation_date.weekday()

    features = pd.DataFrame([[text_length, sentiment, hour_of_day, day_of_week]], 
                            columns=['text_length', 'sentiment', 'hour_of_day', 'day_of_week'])

    quality = quality_model.predict(features)[0]
    return quality

def combined_prediction(question):
    tags = predict_tags(question)
    tags_count = len(tags)
    question_length = len(question)
    predicted_time = predict_answer_time(question_length, tags_count)
    question_quality = predict_question_quality(question)

    return {
        'tags': tags,
        'estimated_time_to_answer': predicted_time,
        'question_quality': question_quality
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python combined_predictor.py <question>")
        sys.exit(1)

    question = sys.argv[1]
    results = combined_prediction(question)
    print(json.dumps(results))
