import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from textblob import TextBlob

# Load questions dataset
def load_data():
    try:
        data = pd.read_csv(r'Questions.csv', encoding='utf-8', nrows=500000)
    except UnicodeDecodeError:
        data = pd.read_csv(r'Questions.csv', encoding='latin-1', nrows=500000)
    return data

# Extract features
def extract_features(df):
    df['text_length'] = df['Body'].apply(len)
    df['sentiment'] = df['Body'].apply(lambda x: TextBlob(x).sentiment.polarity)
    df['hour_of_day'] = pd.to_datetime(df['CreationDate']).dt.hour
    df['day_of_week'] = pd.to_datetime(df['CreationDate']).dt.dayofweek
    df['score_category'] = pd.cut(df['Score'], bins=[-float('inf'), 10, float('inf')], labels=['Low', 'High'])
    return df

# Load and prepare data
data = load_data()
data.dropna(inplace=True)  # Drop rows with missing values
data = extract_features(data)

# Define X and y
X = data[['text_length', 'sentiment', 'hour_of_day', 'day_of_week']]
y = data['score_category']

# Split data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a Random Forest Classifier model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

# Save the model for deployment
import joblib
joblib.dump(model, 'question_quality_model.pkl')

# Function to predict score category
def predict_score_category(question_text, creation_date):
    text_length = len(question_text)
    sentiment = TextBlob(question_text).sentiment.polarity
    hour_of_day = pd.to_datetime(creation_date).hour
    day_of_week = pd.to_datetime(creation_date).dayofweek
    features = pd.DataFrame([[text_length, sentiment, hour_of_day, day_of_week]], columns=X_train.columns)
    predicted_category = model.predict(features)[0]
    return predicted_category

# Example usage
question_text = "In C 11, the new file type modifier was introduced. I was looking for a way to detect such non-public type using reflection, however, I have not find any good way to do so."
creation_date = "2023-04-08T12:00:00Z" # ISO 8601 format
predicted_category = predict_score_category(question_text, creation_date)
print(f"Predicted Score Category: {predicted_category}")
