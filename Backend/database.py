import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

# Path to your downloaded service account key
CREDENTIALS_PATH = "aligntrack-68c74-ee75cc8ae7ae.json"

# Initialize Firebase ONLY if it hasn't been initialized yet
if not firebase_admin._apps:
    if not os.path.exists(CREDENTIALS_PATH):
        raise FileNotFoundError(f"Missing {CREDENTIALS_PATH}! Did you download it from Firebase?")
    
    cred = credentials.Certificate(CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

# Get a reference to the Firestore database
db = firestore.client()

def get_db():
    return db