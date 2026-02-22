import threading
import time
from services.sensor_auto_service import process_sensor_backfill


def start_sensor_scheduler(interval_seconds=10):

    def run():
        while True:
            try:
                process_sensor_backfill()
            except Exception as e:
                print(f"❌ Scheduler runtime error → {e}")

            time.sleep(interval_seconds)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()

    print(f"🚀 Sensor auto-backfill scheduler started (every {interval_seconds}s)")