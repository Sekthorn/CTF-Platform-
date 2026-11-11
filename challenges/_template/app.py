from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route("/")
def index():
    return jsonify({
        "status": "online",
        "service": "WebSec CTF Challenge Target",
        "message": "Target endpoint reachable. Inspect parameters and find the flag."
    })

@app.route("/api/flag")
def get_flag():
    # Example vulnerability check
    auth_header = request.headers.get("X-Admin-Token")
    if auth_header == "admin_secret_token_bypass":
        try:
            with open("/flag.txt", "r") as f:
                return jsonify({"flag": f.read().strip()})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Unauthorized access"}), 403

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
