import json
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

# Load the data
questions_df = pd.read_csv('Questions.csv', encoding='utf-8', nrows=50000)
answers_df = pd.read_csv('Answers.csv', encoding='utf-8', nrows=50000)
tags_df = pd.read_csv('Tags.csv', encoding='utf-8', nrows=50000)

# Rename columns for clarity
answers_df = answers_df.rename(columns={'Body': 'Answer', 'CreationDate': 'AnswerCreationDate'})

# Merge datasets
questions_with_tags_df = pd.merge(questions_df, tags_df, on='Id', how='left')
merged_df = pd.merge(questions_with_tags_df, answers_df, left_on='Id', right_on='ParentId', how='inner')
merged_df.dropna(inplace=True)  # Drop rows with missing values

# Feature Engineering
merged_df['question_length'] = merged_df['Body'].apply(len)
merged_df['tags_count'] = merged_df['Tag'].apply(lambda x: len(x.split(',')))
merged_df['question_date'] = pd.to_datetime(merged_df['CreationDate'])
merged_df['answer_date'] = pd.to_datetime(merged_df['AnswerCreationDate'])
merged_df['time_to_answer'] = (merged_df['answer_date'] - merged_df['question_date']).dt.total_seconds()

# Prepare data for training
X = merged_df[['question_length', 'tags_count']]
y = merged_df['time_to_answer']

# Split data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"Mean Absolute Error: {mae} seconds")
joblib.dump(model, 'answer_time_predictor.pkl')