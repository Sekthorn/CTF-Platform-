from flask import Flask, request, jsonify
import sqlite3
import time
import os

app = Flask(__name__)

FLAGS = {
    "login_bypass": os.environ.get("FLAG_11", os.environ.get("FLAG", "WEBSEC{basic_single_quote_sqli_success}")),
    "numeric": os.environ.get("FLAG_12", os.environ.get("FLAG", "WEBSEC{numeric_sqli_no_quote_filtered}")),
    "union": os.environ.get("FLAG_13", os.environ.get("FLAG", "WEBSEC{union_select_credentials_extracted}")),
    "error_based": os.environ.get("FLAG_14", os.environ.get("FLAG", "WEBSEC{error_based_extractvalue_xpath_leak}")),
    "boolean_blind": os.environ.get("FLAG_15", os.environ.get("FLAG", "WEBSEC{boolean_blind_binary_search_flag}")),
    "time_blind": os.environ.get("FLAG_16", os.environ.get("FLAG", "WEBSEC{time_based_sleep_delay_proven}")),
    "second_order": os.environ.get("FLAG_17", os.environ.get("FLAG", "WEBSEC{second_order_stored_sqli_executed}")),
    "order_by": os.environ.get("FLAG_18", os.environ.get("FLAG", "WEBSEC{order_by_conditional_clause_exploited}")),
    "header": os.environ.get("FLAG_19", os.environ.get("FLAG", "WEBSEC{user_agent_header_sqli_harvested}")),
    "waf_bypass": os.environ.get("FLAG_20", os.environ.get("FLAG", "WEBSEC{advanced_waf_sqli_hex_bypass_mastered}"))
}

def get_db():
    conn = sqlite3.connect(":memory:")
    c = conn.cursor()
    c.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT);")
    c.execute("INSERT INTO users VALUES (1, 'admin', 'SuperSecretPass2026', 'administrator');")
    c.execute("INSERT INTO users VALUES (2, 'john', 'password123', 'staff');")

    c.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category_id INTEGER, status TEXT, secret_info TEXT);")
    c.execute("INSERT INTO products VALUES (1, 'Standard Laptop', 1, 'PUBLIC', 'SKU-001');")
    c.execute("INSERT INTO products VALUES (2, 'Developer Workstation', 1, 'PUBLIC', 'SKU-002');")
    c.execute(f"INSERT INTO products VALUES (999, 'Classified Prototype', 99, 'CONFIDENTIAL', '{FLAGS['numeric']}');")

    c.execute("CREATE TABLE ctf_secrets (id INTEGER PRIMARY KEY, secret_key TEXT, flag TEXT);")
    c.execute(f"INSERT INTO ctf_secrets VALUES (1, 'MASTER_KEY', '{FLAGS['union']}');")
    c.execute(f"INSERT INTO ctf_secrets VALUES (2, 'ORACLE_KEY', '{FLAGS['boolean_blind']}');")

    c.execute("CREATE TABLE visitor_logs (id INTEGER PRIMARY KEY, user_agent TEXT, timestamp DATETIME);")
    conn.commit()
    return conn

db = get_db()

@app.route("/")
def home():
    return jsonify({
        "suite": "WebSec CTF - SQL Injection Practice Lab",
        "category": "sql-injection",
        "challenges_covered": "11-20"
    })

# Challenge 11: Classic Login Bypass
@app.route("/api/login", methods=["POST"])
def login_bypass():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")
    
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}';"
    try:
        cur = db.cursor()
        cur.execute(query)
        user = cur.fetchone()
        if user and user[1] == "admin":
            return jsonify({"success": True, "user": user[1], "flag": FLAGS["login_bypass"]})
        elif user:
            return jsonify({"success": True, "user": user[1], "role": user[3]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Invalid credentials"}), 401

# Challenge 12: Numeric SQL Injection
@app.route("/api/products", methods=["GET"])
def numeric_sqli():
    cat = request.args.get("cat", "1")
    query = f"SELECT id, name, status FROM products WHERE category_id = {cat};"
    try:
        cur = db.cursor()
        cur.execute(query)
        rows = cur.fetchall()
        for r in rows:
            if "CONFIDENTIAL" in str(r) or "Classified" in str(r):
                return jsonify({"products": rows, "flag": FLAGS["numeric"]})
        return jsonify({"products": rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Challenge 13: UNION-Based Data Extraction
@app.route("/api/staff", methods=["GET"])
def union_sqli():
    dept = request.args.get("dept", "IT")
    query = f"SELECT id, username, role FROM users WHERE role = '{dept}';"
    try:
        cur = db.cursor()
        cur.execute(query)
        rows = cur.fetchall()
        for r in rows:
            if "WEBSEC{" in str(r):
                return jsonify({"results": rows, "flag": FLAGS["union"]})
        return jsonify({"results": rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Challenge 14: Error-Based SQL Injection
@app.route("/api/search", methods=["GET"])
def error_sqli():
    q = request.args.get("q", "")
    if "extractvalue" in q.lower() or "updatexml" in q.lower():
        return jsonify({"error": f"XPATH syntax error: '~{FLAGS['error_based']}~'"}), 500
    return jsonify({"results": []})

# Challenge 15: Boolean-Based Blind SQLi
@app.route("/api/users/check", methods=["GET"])
def boolean_blind():
    u = request.args.get("u", "")
    query = f"SELECT id FROM users WHERE username = '{u}';"
    try:
        cur = db.cursor()
        cur.execute(query)
        if cur.fetchone():
            return jsonify({"status": "FOUND", "exists": True})
    except Exception:
        pass
    if "WEBSEC" in u or "ctf_secrets" in u:
        return jsonify({"status": "FOUND", "flag_unlocked": FLAGS["boolean_blind"]})
    return jsonify({"status": "NOT_FOUND", "exists": False})

# Challenge 16: Time-Based Blind SQLi
@app.route("/api/feedback", methods=["GET"])
def time_blind():
    delay = request.args.get("delay", "")
    if "sleep" in delay.lower() or "benchmark" in delay.lower():
        time.sleep(2)
        return jsonify({"status": "ok", "flag": FLAGS["time_blind"]})
    return jsonify({"status": "ok"})

# Challenge 17: Second-Order SQL Injection
stored_name = None
@app.route("/api/register", methods=["POST"])
def register():
    global stored_name
    data = request.get_json(silent=True) or {}
    stored_name = data.get("username", "")
    return jsonify({"success": True, "message": "Registered successfully"})

@app.route("/api/audit", methods=["GET"])
def audit():
    global stored_name
    if stored_name and ("'" in stored_name or "--" in stored_name or "#" in stored_name):
        return jsonify({"audit": "ADMIN_OVERRIDE", "flag": FLAGS["second_order"]})
    return jsonify({"audit": "NORMAL"})

# Challenge 18: ORDER BY SQLi
@app.route("/api/catalog", methods=["GET"])
def order_by_sqli():
    sort = request.args.get("sort", "id")
    if "case" in sort.lower() and "when" in sort.lower():
        return jsonify({"sorted": True, "flag": FLAGS["order_by"]})
    return jsonify({"sorted": True})

# Challenge 19: Blind SQLi via Header
@app.route("/api/telemetry", methods=["GET"])
def telemetry_header():
    ua = request.headers.get("User-Agent", "")
    if "'" in ua and ("sleep" in ua.lower() or "select" in ua.lower()):
        return jsonify({"logged": True, "flag": FLAGS["header"]})
    return jsonify({"logged": True})

# Challenge 20: WAF Filter Bypass SQLi
@app.route("/api/waf/search", methods=["GET"])
def waf_search():
    q = request.args.get("q", "")
    # WAF blocks regular space and uppercase UNION SELECT
    if " UNION SELECT " in q:
        return jsonify({"error": "WAF: Request Blocked (Forbidden tokens detected)"}), 403
    if ("/**/" in q or "%09" in q) and ("union" in q.lower() and "select" in q.lower()):
        return jsonify({"results": ["Confidential Document"], "flag": FLAGS["waf_bypass"]})
    return jsonify({"results": []})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
