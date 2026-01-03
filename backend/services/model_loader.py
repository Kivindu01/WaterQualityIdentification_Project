import pickle
import os
import config

def _load_pickle(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ Pickle file not found: {path}")
    with open(path, "rb") as f:
        return pickle.load(f)

# =========================
# PRE-LIME ASSETS
# =========================

pre_lime_assets = {
    "model": _load_pickle(config.PRE_LIME_MODEL_PATH),
    "scaler": _load_pickle(config.PRE_LIME_SCALER_PATH),
    "explainer": _load_pickle(config.PRE_LIME_EXPLAINER_PATH),
    "conformal": _load_pickle(config.PRE_LIME_CONFORMAL_PATH),
}

print("✅ Pre-lime model assets loaded")

# =========================
# POST-LIME ASSETS
# =========================

post_lime_assets = {
    "model": _load_pickle(config.POST_LIME_MODEL_PATH),
    "scaler": _load_pickle(config.POST_LIME_SCALER_PATH),
    "explainer": _load_pickle(config.POST_LIME_EXPLAINER_PATH),
    "conformal": _load_pickle(config.POST_LIME_CONFORMAL_PATH),
}

print("✅ Post-lime model assets loaded")
