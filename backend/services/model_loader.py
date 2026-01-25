import os
import pickle
import sys

import joblib
import config
import shap
# from utils.turbidity_pipeline_utils import (
#     prepare_features,
#     get_conformal_interval_pre,
#     build_turbidity_explanation_polished,
# )

# 🔑 Alias notebook-defined functions into __main__ for pickle
# main_mod = sys.modules['__main__']
# main_mod.prepare_features = prepare_features
# main_mod.get_conformal_interval_pre = get_conformal_interval_pre
# main_mod.build_turbidity_explanation_polished = build_turbidity_explanation_polished
# =========================
# SAFE PICKLE LOADER
# =========================

def _load_pickle(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ Pickle file not found: {path}")
    with open(path, "rb") as f:
        return pickle.load(f)

# =========================
# PRE-LIME ASSETS
# =========================

pre_lime_model = _load_pickle(config.PRE_LIME_MODEL_PATH)
pre_lime_scaler = _load_pickle(config.PRE_LIME_SCALER_PATH)
pre_lime_conformal = _load_pickle(config.PRE_LIME_CONFORMAL_PATH)

# 🔴 DO NOT LOAD SHAP PICKLE — RECREATE IT
pre_lime_explainer = shap.TreeExplainer(pre_lime_model)

pre_lime_assets = {
    "model": pre_lime_model,
    "scaler": pre_lime_scaler,
    "explainer": pre_lime_explainer,
    "conformal": pre_lime_conformal,
}

print("✅ Pre-lime model assets loaded")

# =========================
# POST-LIME ASSETS
# =========================

post_lime_model = _load_pickle(config.POST_LIME_MODEL_PATH)
post_lime_scaler = _load_pickle(config.POST_LIME_SCALER_PATH)
post_lime_conformal = _load_pickle(config.POST_LIME_CONFORMAL_PATH)

# 🔴 RECREATE SHAP EXPLAINER
post_lime_explainer = shap.TreeExplainer(post_lime_model)

post_lime_assets = {
    "model": post_lime_model,
    "scaler": post_lime_scaler,
    "explainer": post_lime_explainer,
    "conformal": post_lime_conformal,
}

print("✅ Post-lime model assets loaded")

# =========================
# CLASSIFICATION ASSETS
# =========================
classification_model = joblib.load(config.CLASSIFICATION_MODEL_PATH)
classification_threshold = joblib.load(config.CLASSIFICATION_THRESHOLD_PATH)
classification_feature_order = joblib.load(config.CLASSIFICATION_FEATURE_ORDER_PATH)

print("CLASSIFICATION MODEL TYPE:", type(classification_model))
print("CLASSIFICATION FEATURE ORDER:", classification_feature_order)
print("CLASSIFICATION THRESHOLD:", classification_threshold)

classification_assets = {
    "model": classification_model,
    "threshold": classification_threshold,
    "feature_order": classification_feature_order,
}

print("✅ Classification model assets loaded")

# =========================
# ADVANCED REGRESSION ASSETS
# =========================

advance_regression_model = _load_pickle(config.Advance_Regression_MODEL_PATH)
advance_regression_conformal = _load_pickle(config.Advance_Regression_Conformal_MODEL_PATH)

# 🔴 RECREATE SHAP EXPLAINER
advance_regression_explainer = shap.TreeExplainer(advance_regression_model)

advance_regression_assets = {
    "model": advance_regression_model,
    "explainer": advance_regression_explainer,
    "conformal": advance_regression_conformal,
}

print("✅ Advance Regression model assets loaded")

# =========================
# NORMAL REGRESSION ASSETS
# =========================

normal_regression_model = _load_pickle(config.NORMAL_Regression_MODEL_PATH)
normal_regression_conformal = _load_pickle(config.NORMAL_Regression_Conformal_MODEL_PATH)
normal_regression_features = _load_pickle(config.NORMAL_Regression_FEATURE_PATH)
normal_regression_explainer = shap.TreeExplainer(normal_regression_model)
normal_regression_assets = {
    "model": normal_regression_model,
    "explainer": normal_regression_explainer,
    "conformal": normal_regression_conformal,
    "feature_names": normal_regression_features,
}

print("✅ Regression model assets loaded")
