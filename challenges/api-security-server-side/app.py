from flask import Flask, request, jsonify, render_template_string
import json
import os

app = Flask(__name__)

FLAGS = {
    "debug_env": os.environ.get("FLAG_41", os.environ.get("FLAG", "WEBSEC{api_debug_metadata_keys_exposed}")),
    "missing_auth": os.environ.get("FLAG_42", os.environ.get("FLAG", "WEBSEC{api_unauthenticated_bulk_user_export}")),
    "mass_assign": os.environ.get("FLAG_43", os.environ.get("FLAG", "WEBSEC{mass_assignment_is_admin_true}")),
    "excessive_data": os.environ.get("FLAG_44", os.environ.get("FLAG", "WEBSEC{excessive_json_response_password_hash_leak}")),
    "ssrf_loopback": os.environ.get("FLAG_45", os.environ.get("FLAG", "WEBSEC{ssrf_loopback_internal_admin_portal}")),
    "ssrf_cloud": os.environ.get("FLAG_46", os.environ.get("FLAG", "WEBSEC{ssrf_imds_v1_metadata_token_retrieved}")),
    "bopla": os.environ.get("FLAG_47", os.environ.get("FLAG", "WEBSEC{bopla_sensitive_salary_property_tampered}")),
    "ssti": os.environ.get("FLAG_48", os.environ.get("FLAG", "WEBSEC{jinja2_ssti_config_items_secret_key}")),
    "rate_limit": os.environ.get("FLAG_49", os.environ.get("FLAG", "WEBSEC{rate_limit_bypass_x_forwarded_for_spoof}")),
    "exploit_chain": os.environ.get("FLAG_50", os.environ.get("FLAG", "WEBSEC{multi_stage_api_auth_chain_conquered}"))
}

app.config["SECRET_KEY"] = FLAGS["ssti"]

ip_attempts = {}

@app.route("/")
def home():
    return jsonify({
        "suite": "WebSec CTF - API Security & Server-Side Practice Lab",
        "category": "api-security-server-side",
        "challenges_covered": "41-50"
    })

# Challenge 41: Information Disclosure via Debug Endpoint
@app.route("/api/v1/debug/env")
def debug_env():
    return jsonify({
        "status": "DEVELOPMENT_MODE_ACTIVE",
        "NODE_ENV": "development",
        "PORT": 8080,
        "SYSTEM_FLAG": FLAGS["debug_env"]
    })

# Challenge 42: Missing API Authentication
@app.route("/api/v1/export/users")
def export_users():
    # Unprotected bulk dump
    return jsonify({
        "total_exported": 2,
        "users": [
            {"id": 1, "username": "admin", "flag": FLAGS["missing_auth"]},
            {"id": 2, "username": "operator", "flag": None}
        ]
    })

# Challenge 43: Mass Assignment
@app.route("/api/v1/user/profile", methods=["PUT"])
def mass_assign():
    data = request.get_json(silent=True) or {}
    if data.get("isAdmin") is True or data.get("role") == "admin":
        return jsonify({"success": True, "isAdmin": True, "flag": FLAGS["mass_assign"]})
    return jsonify({"success": True, "isAdmin": False, "role": "user"})

# Challenge 44: Excessive Data Exposure
@app.route("/api/v1/team/members")
def team_members():
    return jsonify([
        {"id": 1, "name": "Alice Security", "role": "Lead", "secret_token": FLAGS["excessive_data"], "hash": "$2a$12$e8h1..."}
    ])

# Challenge 45: Basic SSRF to Loopback Service
@app.route("/api/v1/preview", methods=["POST"])
def ssrf_loopback():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "")
    if "127.0.0.1" in url or "localhost" in url:
        return jsonify({
            "fetched_url": url,
            "status": 200,
            "body": f"<html><body><h1>Localhost Admin Console</h1><p>Key: {FLAGS['ssrf_loopback']}</p></body></html>"
        })
    return jsonify({"fetched_url": url, "status": 200, "body": "Mock external page"})

# Challenge 46: SSRF Cloud Metadata
@app.route("/api/v1/cloud/import", methods=["POST"])
def ssrf_cloud():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "")
    if "169.254.169.254" in url or "2852039166" in url or "0xa9fea9fe" in url:
        return jsonify({
            "AccessKeyId": "ASIA42EXAMPLEKEY",
            "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
            "Token": FLAGS["ssrf_cloud"]
        })
    return jsonify({"error": "Failed to connect to provider"}), 400

# Challenge 47: BOPLA Property Tampering
@app.route("/api/v1/employees/me", methods=["PATCH"])
def bopla_tamper():
    data = request.get_json(silent=True) or {}
    if data.get("clearance_level") == 5 or data.get("salary", 0) > 500000:
        return jsonify({"success": True, "clearance": 5, "flag": FLAGS["bopla"]})
    return jsonify({"success": True, "clearance": 1})

# Challenge 48: Server-Side Template Injection (SSTI)
@app.route("/api/v1/render/template", methods=["POST"])
def ssti_render():
    data = request.get_json(silent=True) or {}
    template = data.get("template", "")
    try:
        rendered = render_template_string(template)
        return jsonify({"rendered": rendered})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Challenge 49: Rate Limit Bypass via Header Spoofing
@app.route("/api/v1/vault/pin", methods=["POST"])
def rate_limit_pin():
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    data = request.get_json(silent=True) or {}
    pin = str(data.get("pin", ""))

    attempts = ip_attempts.get(client_ip, 0)
    if attempts >= 5:
        return jsonify({"error": "Too Many Requests (Rate limit exceeded for IP)"}), 429

    ip_attempts[client_ip] = attempts + 1
    if pin == "7421":
        return jsonify({"success": True, "flag": FLAGS["rate_limit"]})
    return jsonify({"success": False, "attempts_remaining": 5 - ip_attempts[client_ip]}), 400

# Challenge 50: Multi-Stage API Exploitation Chain
@app.route("/api/v2/master/chain", methods=["POST"])
def exploit_chain():
    auth = request.headers.get("X-Master-Token", "")
    data = request.get_json(silent=True) or {}
    if auth == "MASTER_AUDIT_TOKEN_001" and data.get("unlocked") is True:
        return jsonify({"status": "VAULT_BREACHED", "crown_flag": FLAGS["exploit_chain"]})
    return jsonify({"error": "Unauthorized chain step"}), 403

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
