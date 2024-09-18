import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.linear_model import SGDClassifier
from sklearn.multiclass import OneVsRestClassifier
import joblib
import warnings
warnings.filterwarnings('ignore', category=UserWarning)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# Load data
questions = pd.read_csv('Questions.csv', encoding='ISO-8859-1', nrows=3000)
tags = pd.read_csv('Tags.csv', encoding='ISO-8859-1', nrows=3000)

# Filter out rows with missing tags
tags.dropna(subset=['Tag'], inplace=True)

# Ensure that all tags are strings
tags['Tag'] = tags['Tag'].astype(str)

# Group the tags by 'Id' and aggregate them into lists
grouped_tags = tags.groupby('Id')['Tag'].apply(list).reset_index()

# Merge Questions and Grouped Tags
merged_data = pd.merge(questions, grouped_tags, on='Id', how='inner')

# Assuming the questions are in the 'Title' column and tags in the 'Tag' column
X = merged_data['Title']
y = merged_data['Tag']  # No need to split if each tag is already a list

# Binarize the tags
mlb = MultiLabelBinarizer(sparse_output=True)  # Ensure sparse output
y = mlb.fit_transform(y)

# Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create the model pipeline with SGDClassifier
tfidf_vectorizer = TfidfVectorizer(max_features=10000, stop_words='english')
X_train_tfidf = tfidf_vectorizer.fit_transform(X_train)
X_test_tfidf = tfidf_vectorizer.transform(X_test)

model = LogisticRegression(solver='liblinear')
model.fit(X_train_tfidf, y_train)
y_pred = model.predict(X_test_tfidf)
  # We can pass y directly without converting it to dense

# Save the model and binarizer
joblib.dump(model, 'tag_predictor_model.pkl')
joblib.dump(mlb, 'tag_binarizer.pkl')

