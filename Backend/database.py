import os
import firebase_admin
from firebase_admin import credentials, firestore

# 1. The Bulletproof Cloud Path: Render always mounts secrets here
RENDER_SECRET = "/etc/secrets/aligntrack-68c74-firebase-adminsdk-fbsvc-7696bb17ea.json"

# 2. The Local Fallback Path: For when you are testing on your own laptop
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_SECRET = os.path.join(BASE_DIR, "aligntrack-68c74-firebase-adminsdk-fbsvc-7696bb17ea.json")

# 3. Smart Selection: Use Render's vault if it exists, otherwise use local
CREDENTIALS_PATH = RENDER_SECRET if os.path.exists(RENDER_SECRET) else LOCAL_SECRET

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