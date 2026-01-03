import os
from urllib.parse import quote_plus

# =========================
# ENVIRONMENT
# =========================

ENV = os.getenv("FLASK_ENV", "development")
DEBUG = ENV == "development"

# =========================
# APPLICATION CONSTANTS
# =========================

APP_NAME = "Water Quality Backend"
API_VERSION = "v1"

# =========================
# MONGODB CONFIGURATION
# =========================

MONGODB_USERNAME = quote_plus(os.getenv("MONGODB_USERNAME", "user"))
MONGODB_PASSWORD = quote_plus(os.getenv("MONGODB_PASSWORD", "password01"))

MONGODB_CLUSTER_HOST = os.getenv(
    "MONGODB_CLUSTER_HOST",
    "cluster0.ktal1gc.mongodb.net"
)

MONGODB_DATABASE_NAME = os.getenv(
    "MONGODB_DATABASE_NAME",
    "water_quality_db"
)

MONGODB_URI = (
    f"mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}"
    f"@{MONGODB_CLUSTER_HOST}/"
    f"?retryWrites=true&w=majority"
)

# =========================
# MODEL PATHS (PHASE 3)
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# -------- PRE-LIME --------
PRE_LIME_MODEL_PATH = os.path.join(
    MODELS_DIR, "prelime", "pre_lime_model.pkl"
)
PRE_LIME_SCALER_PATH = os.path.join(
    MODELS_DIR, "prelime", "pre_lime_scaler.pkl"
)
PRE_LIME_EXPLAINER_PATH = os.path.join(
    MODELS_DIR, "prelime", "pre_lime_explainer.pkl"
)
PRE_LIME_CONFORMAL_PATH = os.path.join(
    MODELS_DIR, "prelime", "pre_lime_conformal.pkl"
)

# -------- POST-LIME --------
POST_LIME_MODEL_PATH = os.path.join(
    MODELS_DIR, "postlime", "post_lime_model.pkl"
)
POST_LIME_SCALER_PATH = os.path.join(
    MODELS_DIR, "postlime", "post_lime_scaler.pkl"
)
POST_LIME_EXPLAINER_PATH = os.path.join(
    MODELS_DIR, "postlime", "post_lime_explainer.pkl"
)
POST_LIME_CONFORMAL_PATH = os.path.join(
    MODELS_DIR, "postlime", "post_lime_conformal.pkl"
)
