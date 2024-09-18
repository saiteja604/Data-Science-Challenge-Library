import sys
import joblib
import json

# Load the model and the binarizer
model = joblib.load('tag_predictor_model.pkl')
mlb = joblib.load('tag_binarizer.pkl')

def preprocess_text(question):
    # Add any required preprocessing steps here
    return question.lower()

def predict_tags(question):
    # Process the question
    processed_question = preprocess_text(question)

    # Predict tags
    tags_pred = model.predict([processed_question])

    # Inverse transform to get tag names
    tags = mlb.inverse_transform(tags_pred)

    # Convert the result to a list of tags
    tags_list = [tag for sublist in tags for tag in sublist]
    return tags_list

if __name__ == '__main__':
    question = sys.stdin.readline()
    predicted_tags = predict_tags(question.strip())
    print(json.dumps(predicted_tags))
