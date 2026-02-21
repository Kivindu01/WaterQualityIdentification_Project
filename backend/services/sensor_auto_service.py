from datetime import datetime
import config

from ml_logic.pre_lime_logic import get_optimal_pre_lime_dose_with_shap
from ml_logic.post_lime_logic import get_optimal_post_lime_dose_with_shap

from database.pre_lime_auto_repository import (
    save_pre_lime_auto_prediction,
    is_pre_lime_predicted
)

from database.post_lime_auto_repository import (
    save_post_lime_auto_prediction,
    is_post_lime_predicted
)

from ml_logic.classification_logic import classify_water_safety

from database.classification_auto_repository import (
    save_classification_auto_prediction,
    is_classification_predicted
)

from ml_logic.normal_regression_logic import predict_turbidity

from database.normal_regression_auto_repository import (
    save_normal_regression_auto_prediction,
    is_normal_regression_predicted
)

from database.mongo import get_database


# =====================================
# FETCH SENSOR RECORDS
# =====================================

def fetch_latest_sensor_records(limit=8000):
    db = get_database(config.SENSOR_DATABASE_NAME)
    collection = db[config.SENSOR_COLLECTION_NAME]

    records = list(
        collection.find()
        .sort("createdAt", -1)
        .limit(limit)
    )

    print(f"🔍 Found {len(records)} records in automatic_readings")
    return records


# =====================================
# BACKFILL PROCESS
# =====================================

def process_sensor_backfill():

    print("⏱ Scheduler check started...")

    records = fetch_latest_sensor_records(limit=8000)

    if not records:
        print("⚠ No sensor data found.")
        return

    new_predictions = 0

    for record in records:

        sensor_id = record["_id"]
        print(f"⚙ Processing sensor record: {sensor_id}")

        try:

            # ==============================
            # CLASSIFICATION
            # ==============================
            try:
                classification_result = classify_water_safety(
                    ph=record["ph"],
                    turbidity=record["turbidity"],
                    conductivity=record["conductivity"]
                )

                save_classification_auto_prediction({
                    "sensor_record_id": sensor_id,
                    "sensor_created_at": record["createdAt"],
                    "raw_inputs": {
                        "ph": record["ph"],
                        "turbidity": record["turbidity"],
                        "conductivity": record["conductivity"]
                    },
                    "prediction": classification_result,
                    "classified_at": datetime.utcnow()
                })

                print("✅ Classification saved")

            except Exception as e:
                if "E11000" in str(e):
                    print(f"⚠ Classification duplicate skipped for {sensor_id}")
                else:
                    raise e

            # ==============================
            # NORMAL REGRESSION
            # ==============================
            try:
                normal_result = predict_turbidity({
                    "turbidity": record["turbidity"],
                    "ph": record["ph"],
                    "conductivity": record["conductivity"]
                })

                save_normal_regression_auto_prediction({
                    "sensor_record_id": sensor_id,
                    "sensor_created_at": record["createdAt"],
                    "raw_inputs": {
                        "turbidity": record["turbidity"],
                        "ph": record["ph"],
                        "conductivity": record["conductivity"]
                    },
                    "prediction": normal_result,
                    "predicted_at": datetime.utcnow()
                })

                print("✅ Normal regression saved")

            except Exception as e:
                if "E11000" in str(e):
                    print(f"⚠ Normal regression duplicate skipped for {sensor_id}")
                else:
                    raise e

            # ==============================
            # PRE-LIME
            # ==============================
            try:
                pre_result = get_optimal_pre_lime_dose_with_shap(
                    raw_ph=record["ph"],
                    raw_turbidity=record["turbidity"],
                    raw_conductivity=record["conductivity"]
                )

                save_pre_lime_auto_prediction({
                    "sensor_record_id": sensor_id,
                    "sensor_created_at": record["createdAt"],
                    "raw_inputs": {
                        "raw_ph": record["ph"],
                        "raw_turbidity": record["turbidity"],
                        "raw_conductivity": record["conductivity"]
                    },
                    "prediction": pre_result,
                    "predicted_at": datetime.utcnow()
                })

                print("✅ Pre-lime prediction saved")

            except Exception as e:
                if "E11000" in str(e):
                    print(f"⚠ Pre-lime duplicate skipped for {sensor_id}")
                else:
                    raise e

            # ==============================
            # POST-LIME
            # ==============================
            try:
                # Ensure pre_result exists if needed
                if "pre_result" not in locals():
                    pre_result = get_optimal_pre_lime_dose_with_shap(
                        raw_ph=record["ph"],
                        raw_turbidity=record["turbidity"],
                        raw_conductivity=record["conductivity"]
                    )

                post_result = get_optimal_post_lime_dose_with_shap(
                    raw_ph=pre_result["predicted_settled_pH"],
                    raw_turbidity=record["turbidity"],
                    raw_conductivity=record["conductivity"]
                )

                save_post_lime_auto_prediction({
                    "sensor_record_id": sensor_id,
                    "sensor_created_at": record["createdAt"],
                    "input_from_pre_lime": pre_result["predicted_settled_pH"],
                    "prediction": post_result,
                    "predicted_at": datetime.utcnow()
                })

                print("✅ Post-lime prediction saved")

            except Exception as e:
                if "E11000" in str(e):
                    print(f"⚠ Post-lime duplicate skipped for {sensor_id}")
                else:
                    raise e

            new_predictions += 1

        except Exception as e:
            print(f"❌ Unexpected error for {sensor_id} → {e}")

    print(f"🚀 {new_predictions} sensor records processed.")