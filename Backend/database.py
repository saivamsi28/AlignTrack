import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

# 1. Find the main root folder of your project (where Render drops Secret Files)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 

# 2. Tell it to look for a file named "firebase.json" in that root folder
CREDENTIALS_PATH = os.path.join(BASE_DIR, "68c74-firebase-adminsdk-fbsvc-7696bb17ea.json")

# Initialize Firebase ONLY if it hasn't been initialized yet
if not firebase_admin._apps:
    if not os.path.exists(CREDENTIALS_PATH):
        raise FileNotFoundError(f"Missing {CREDENTIALS_PATH}! Did you add the Secret File in Render?")
    
    cred = credentials.Certificate(CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

# Get a reference to the Firestore database
db = firestore.client()

def get_db():
    return db