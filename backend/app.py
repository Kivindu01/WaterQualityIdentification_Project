from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import config


def create_app():
    app = Flask(__name__)

    # =========================
    # LOAD CONFIG
    # =========================
    app.config["ENV"] = config.ENV
    app.config["DEBUG"] = config.DEBUG
    app.config["APP_NAME"] = config.APP_NAME
    app.config["API_VERSION"] = config.API_VERSION

    # =========================
    # JWT CONFIG
    # =========================
    app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = config.JWT_ACCESS_TOKEN_EXPIRES

    # =========================
    # ENABLE CORS
    # =========================
    CORS(app)

    # =========================
    # INIT JWT
    # =========================
    JWTManager(app)

    # =========================
    # INITIALIZE MAIN DATABASE
    # =========================
    from database.mongo import get_database
    get_database()  # main DB

    # =========================
    # INITIALIZE SENSOR DATABASE
    # =========================
    sensor_db = get_database(config.SENSOR_DATABASE_NAME)

    # Create unique indexes (prevent duplicates)
    sensor_db["pre_lime_auto_predictions"].create_index(
        "sensor_record_id",
        unique=True
    )

    sensor_db["post_lime_auto_predictions"].create_index(
        "sensor_record_id",
        unique=True
    )

    print("✅ Sensor prediction indexes ensured")

    # =========================
    # LOAD ML MODELS (FAIL FAST)
    # =========================
    import services.model_loader

    # =========================
    # REGISTER API ROUTES
    # =========================
    from routes.pre_lime_routes import pre_lime_bp
    from routes.post_lime_routes import post_lime_bp
    from routes.history_routes import history_bp
    from routes.classification_routes import classification_bp
    from routes.advance_regression_routes import advance_regression_bp
    from routes.normal_regression_routes import normal_regression_bp
    from routes.auth_routes import auth_bp
    from routes.sensor_auto_routes import sensor_auto_bp

    app.register_blueprint(pre_lime_bp, url_prefix="/api/v1/pre-lime")
    app.register_blueprint(post_lime_bp, url_prefix="/api/v1/post-lime")
    app.register_blueprint(history_bp, url_prefix="/api/v1/history")
    app.register_blueprint(classification_bp, url_prefix="/api/v1/classify")
    app.register_blueprint(advance_regression_bp, url_prefix="/api/v1/advance-regression")
    app.register_blueprint(normal_regression_bp, url_prefix="/api/v1/normal-regression")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(sensor_auto_bp, url_prefix="/api/v1/sensor")

    # =========================
    # START SENSOR AUTO-SCHEDULER
    # =========================
    from services.sensor_scheduler import start_sensor_scheduler
    start_sensor_scheduler(interval_seconds=10)

    # =========================
    # HEALTH CHECK
    # =========================
    @app.route("/", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "OK",
            "app": app.config["APP_NAME"],
            "environment": app.config["ENV"],
            "version": app.config["API_VERSION"]
        }), 200

    # =========================
    # ERROR HANDLERS
    # =========================
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": "error",
            "message": "Resource not found"
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001)