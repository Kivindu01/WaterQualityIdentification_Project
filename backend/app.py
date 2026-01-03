from flask import Flask, jsonify
from flask_cors import CORS
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
    # ENABLE CORS
    # =========================
    CORS(app)

    # =========================
    # INITIALIZE DATABASE (FAIL FAST)
    # =========================
    from database.mongo import get_database
    get_database()

    # =========================
    # LOAD ML MODELS INTO MEMORY (FAIL FAST)
    # =========================
    import services.model_loader

    # =========================
    # REGISTER API ROUTES
    # =========================
    from routes.pre_lime_routes import pre_lime_bp
    from routes.post_lime_routes import post_lime_bp

    app.register_blueprint(pre_lime_bp, url_prefix="/api/v1/pre-lime")
    app.register_blueprint(post_lime_bp, url_prefix="/api/v1/post-lime")

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
    # GLOBAL ERROR HANDLERS
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
    app.run(host="0.0.0.0", port=5000)
