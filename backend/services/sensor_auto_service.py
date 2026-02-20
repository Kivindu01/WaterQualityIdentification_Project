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

        # Skip if already predicted
        if is_pre_lime_predicted(sensor_id):
            continue

        print(f"⚙ Processing sensor record: {sensor_id}")

        try:
            # --------------------------
            # PRE-LIME
            # --------------------------
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

            # --------------------------
            # POST-LIME
            # --------------------------
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

            new_predictions += 1

        except Exception as e:
            print(f"❌ Prediction failed for {sensor_id} → {e}")

    if new_predictions == 0:
        print("✔ No new sensor records to predict.")
    else:
        print(f"🚀 {new_predictions} new sensor records predicted.")