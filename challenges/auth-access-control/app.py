from flask import Flask, request, jsonify, make_response
import base64
import time
import os

app = Flask(__name__)

# Target Flags for Category 1 (Challenges 01–10) - Supports Dynamic Injected Flags
FLAGS = {
    "weak_admin": os.environ.get("FLAG_01", os.environ.get("FLAG", "WEBSEC{weak_admin_password_cracked_2026}")),
    "user_enum": os.environ.get("FLAG_02", os.environ.get("FLAG", "WEBSEC{user_enumeration_response_diff_found}")),
    "idor": os.environ.get("FLAG_03", os.environ.get("FLAG", "WEBSEC{idor_profile_privilege_leak_success}")),
    "reset_flaw": os.environ.get("FLAG_04", os.environ.get("FLAG", "WEBSEC{password_reset_token_entropy_flawed}")),
    "missing_role": os.environ.get("FLAG_05", os.environ.get("FLAG", "WEBSEC{missing_role_authorization_check_bypass}")),
    "bola": os.environ.get("FLAG_06", os.environ.get("FLAG", "WEBSEC{bola_order_resource_id_hijack}")),
    "fixation": os.environ.get("FLAG_07", os.environ.get("FLAG", "WEBSEC{session_fixation_auth_token_reused}")),
    "jwt_none": os.environ.get("FLAG_08", os.environ.get("FLAG", "WEBSEC{jwt_alg_none_signature_stripped_admin}")),
    "param_tamper": os.environ.get("FLAG_09", os.environ.get("FLAG", "WEBSEC{param_tamper_role_escalated_to_superadmin}")),
    "mfa": os.environ.get("FLAG_10", os.environ.get("FLAG", "WEBSEC{mfa_response_status_manipulation_passed}"))
}

USERS_DB = {
    "admin": {"id": 1, "password": "admin2026", "role": "admin", "email": "admin@websec.ctf"},
    "sec_analyst": {"id": 2, "password": "password123", "role": "analyst", "email": "analyst@websec.ctf"},
    "guest": {"id": 105, "password": "guest", "role": "user", "email": "guest@websec.ctf"}
}

@app.route("/")
def home():
    return jsonify({
        "suite": "WebSec CTF - Authentication & Access Control Lab",
        "category": "auth-access-control",
        "challenges_covered": "01-10",
        "endpoints": [
            "/api/login",
            "/api/users/profile",
            "/api/password-reset",
            "/admin/system/metrics",
            "/api/orders/<id>",
            "/api/session",
            "/api/admin/flag",
            "/api/user/profile",
            "/api/verify-2fa"
        ]
    })

# Challenge 01 & 02: Weak Admin Password & User Enumeration
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")

    if username not in USERS_DB:
        return jsonify({"error": "User does not exist"}), 404

    user = USERS_DB[username]
    if user["password"] != password:
        return jsonify({"error": "Incorrect password for user"}), 401

    flag = FLAGS["weak_admin"] if username == "admin" else FLAGS["user_enum"]
    return jsonify({
        "success": True,
        "message": f"Welcome {username}",
        "user": {"id": user["id"], "username": username, "role": user["role"]},
        "flag": flag
    })

# Challenge 03: IDOR Profile
@app.route("/api/users/profile", methods=["GET"])
def get_profile():
    user_id = request.args.get("id", "105")
    if str(user_id) == "1":
        return jsonify({
            "id": 1,
            "username": "admin",
            "role": "Administrator",
            "recovery_key": FLAGS["idor"],
            "notes": "System master profile"
        })
    return jsonify({
        "id": int(user_id) if user_id.isdigit() else 105,
        "username": "guest_user",
        "role": "Standard User",
        "notes": "Regular student profile"
    })

# Challenge 04: Password Reset Token Flaw
@app.route("/api/password-reset", methods=["POST"])
def password_reset():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    if token:
        # Check predictable token: base64(admin:timestamp)
        try:
            decoded = base64.b64decode(token).decode("utf-8")
            if decoded.startswith("admin:"):
                return jsonify({"success": True, "flag": FLAGS["reset_flaw"]})
        except Exception:
            pass
        return jsonify({"error": "Invalid token"}), 400
    
    # Generate token
    gen_token = base64.b64encode(f"user:{int(time.time())}".encode()).decode()
    return jsonify({"message": "Reset token generated", "sample_token": gen_token})

# Challenge 05: Missing Role Check
@app.route("/admin/system/metrics", methods=["GET"])
def admin_metrics():
    # Only checks existence of auth header/cookie, ignores role
    return jsonify({
        "system": "WebSec Internal Kernel v5.4",
        "active_threads": 42,
        "flag": FLAGS["missing_role"]
    })

# Challenge 06: BOLA Order
@app.route("/api/orders/<order_id>", methods=["GET"])
def get_order(order_id):
    if order_id == "ORD-99021":
        return jsonify({
            "order_id": order_id,
            "customer": "executive_director",
            "status": "DELIVERED",
            "item": "Classified Security Dossier",
            "flag": FLAGS["bola"]
        })
    return jsonify({"order_id": order_id, "customer": "guest", "item": "Standard Sticker Pack"})

# Challenge 07: Session Fixation
@app.route("/api/session", methods=["GET", "POST"])
def session_handler():
    cookie_token = request.cookies.get("session_id") or request.headers.get("X-Session-ID")
    if cookie_token == "ATTACKER_CONTROLLED_SESSION_TOKEN":
        return jsonify({"status": "AUTHENTICATED", "user": "target_victim", "flag": FLAGS["fixation"]})
    resp = make_response(jsonify({"message": "Session initialized"}))
    resp.set_cookie("session_id", cookie_token or "DEFAULT_SESSION_001")
    return resp

# Challenge 08: JWT None Algorithm
@app.route("/api/admin/flag", methods=["GET"])
def jwt_none_flag():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        parts = token.split(".")
        if len(parts) >= 2:
            try:
                # Add base64 padding
                header_raw = parts[0] + "=" * (-len(parts[0]) % 4)
                payload_raw = parts[1] + "=" * (-len(parts[1]) % 4)
                header = base64.urlsafe_b64decode(header_raw).decode()
                payload = base64.urlsafe_b64decode(payload_raw).decode()
                if '"alg":"none"' in header.lower().replace(" ", "") and '"role":"admin"' in payload.lower().replace(" ", ""):
                    return jsonify({"success": True, "flag": FLAGS["jwt_none"]})
            except Exception as e:
                return jsonify({"error": str(e)}), 400
    return jsonify({"error": "Requires valid admin token"}), 403

# Challenge 09: Privilege Escalation via Parameter Tampering
@app.route("/api/user/profile", methods=["PUT"])
def update_profile():
    data = request.get_json(silent=True) or {}
    if data.get("role") == "superadmin" or data.get("is_admin") is True or data.get("tier") == "executive":
        return jsonify({"success": True, "message": "Elevated to superadmin", "flag": FLAGS["param_tamper"]})
    return jsonify({"success": True, "message": "Profile updated", "current_role": "user"})

# Challenge 10: Multi-Factor Authentication Bypass
@app.route("/api/verify-2fa", methods=["POST"])
def verify_2fa():
    data = request.get_json(silent=True) or {}
    otp = str(data.get("otp", ""))
    if otp == "984210":
        return jsonify({"success": True, "status": "VERIFIED", "flag": FLAGS["mfa"]})
    # Flawed: if client overrides response to success: true, client accepts it
    return jsonify({"success": False, "status": "FAIL", "error": "Invalid OTP code"}), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
