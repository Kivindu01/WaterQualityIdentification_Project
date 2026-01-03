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
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)
