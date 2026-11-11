from flask import Flask, request, jsonify, render_template_string, make_response
import os

app = Flask(__name__)

FLAGS = {
    "reflected": os.environ.get("FLAG_21", os.environ.get("FLAG", "WEBSEC{reflected_xss_script_alert_triggered}")),
    "dom_inner": os.environ.get("FLAG_22", os.environ.get("FLAG", "WEBSEC{dom_innerhtml_sink_hash_unfiltered}")),
    "stored": os.environ.get("FLAG_23", os.environ.get("FLAG", "WEBSEC{stored_guestbook_persistent_script_payload}")),
    "attribute": os.environ.get("FLAG_24", os.environ.get("FLAG", "WEBSEC{attribute_breakout_onfocus_autofocus}")),
    "js_url": os.environ.get("FLAG_25", os.environ.get("FLAG", "WEBSEC{javascript_pseudo_protocol_href_click}")),
    "filter_bypass": os.environ.get("FLAG_26", os.environ.get("FLAG", "WEBSEC{filter_bypass_onerror_img_tag}")),
    "dom_write": os.environ.get("FLAG_27", os.environ.get("FLAG", "WEBSEC{dom_document_write_location_search_leak}")),
    "blind_xss": os.environ.get("FLAG_28", os.environ.get("FLAG", "WEBSEC{blind_xss_admin_cookie_beaconed}")),
    "markdown": os.environ.get("FLAG_29", os.environ.get("FLAG", "WEBSEC{markdown_custom_sanitizer_bypass_rce}")),
    "csp_bypass": os.environ.get("FLAG_30", os.environ.get("FLAG", "WEBSEC{csp_script_src_nonce_gadget_bypassed}"))
}

guestbook_entries = []

@app.route("/")
def home():
    return jsonify({
        "suite": "WebSec CTF - Cross-Site Scripting (XSS) Practice Lab",
        "category": "cross-site-scripting",
        "challenges_covered": "21-30"
    })

# Challenge 21: Reflected XSS Basic
@app.route("/search")
def reflected_xss():
    q = request.args.get("q", "")
    html = f"""
    <html>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: {q}</p>
        <script>window.FLAG = "{FLAGS['reflected']}";</script>
      </body>
    </html>
    """
    return render_template_string(html)

# Challenge 22: DOM-Based innerHTML Injection
@app.route("/dom")
def dom_inner():
    html = f"""
    <html>
      <body>
        <h1>DOM Preview</h1>
        <div id="preview"></div>
        <script>
          const hash = decodeURIComponent(window.location.hash.slice(1));
          if (hash) {{
            document.getElementById('preview').innerHTML = hash;
          }}
          window.DOM_FLAG = "{FLAGS['dom_inner']}";
        </script>
      </body>
    </html>
    """
    return render_template_string(html)

# Challenge 23: Stored Guestbook XSS
@app.route("/api/guestbook", methods=["GET", "POST"])
def guestbook():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        comment = data.get("comment", "")
        guestbook_entries.append(comment)
        is_xss = "<script" in comment.lower() or "onerror" in comment.lower() or "onload" in comment.lower()
        return jsonify({
            "success": True,
            "admin_reviewed": True,
            "flag": FLAGS["stored"] if is_xss else None
        })
    return jsonify({"comments": guestbook_entries})

# Challenge 24: Attribute-Based XSS
@app.route("/profile")
def attribute_xss():
    val = request.args.get("theme", "dark")
    html = f"""
    <html>
      <body>
        <input type="text" name="theme" value="{val}">
        <!-- Attribute flag available if autofocus event breakout succeeds -->
        <div id="secret" data-flag="{FLAGS['attribute']}"></div>
      </body>
    </html>
    """
    return render_template_string(html)

# Challenge 25: JavaScript URL Scheme XSS
@app.route("/website")
def js_scheme():
    url = request.args.get("url", "https://example.com")
    html = f"""
    <html>
      <body>
        <p>User Portfolio: <a id="user-link" href="{url}">Visit Link</a></p>
        <script>
          if ("{url}".toLowerCase().startsWith("javascript:")) {{
            window.FLAG = "{FLAGS['js_url']}";
          }}
        </script>
      </body>
    </html>
    """
    return render_template_string(html)

# Challenge 26: Filter Evasion via Event Handlers
@app.route("/filter")
def filter_evasion():
    payload = request.args.get("p", "")
    # naive filter removes script and onload
    cleaned = payload.replace("<script>", "").replace("onload", "")
    has_xss = "onerror" in cleaned.lower() or "svg" in cleaned.lower()
    return jsonify({
        "rendered": cleaned,
        "xss_triggered": has_xss,
        "flag": FLAGS["filter_bypass"] if has_xss else None
    })

# Challenge 27: DOM document.write
@app.route("/tracker")
def dom_doc_write():
    ref = request.args.get("ref", "")
    html = f"""
    <html>
      <body>
        <script>
          const ref = "{ref}";
          document.write("<img src='/pixel?ref=" + ref + "' />");
          window.WRITE_FLAG = "{FLAGS['dom_write']}";
        </script>
      </body>
    </html>
    """
    return render_template_string(html)

# Challenge 28: Blind XSS
@app.route("/api/contact", methods=["POST"])
def blind_xss():
    data = request.get_json(silent=True) or {}
    msg = data.get("message", "")
    if "script" in msg.lower() or "cookie" in msg.lower() or "fetch" in msg.lower():
        return jsonify({
            "status": "ticket_submitted",
            "bot_callback": "triggered",
            "admin_cookie_leaked": f"token={FLAGS['blind_xss']}"
        })
    return jsonify({"status": "ticket_submitted"})

# Challenge 29: Markdown Parser Injection
@app.route("/api/markdown", methods=["POST"])
def markdown_parser():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    # Check for bypass through link titles or comments
    if "javascript:" in text or ("<!--" in text and "onerror" in text):
        return jsonify({"html": text, "flag": FLAGS["markdown"]})
    return jsonify({"html": f"<p>{text}</p>"})

# Challenge 30: CSP Bypass
@app.route("/csp")
def csp_bypass():
    gadget = request.args.get("x", "")
    resp = make_response(render_template_string(f"""
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.2/angular.min.js"></script>
      </head>
      <body ng-app>
        <div>{gadget}</div>
        <script>window.CSP_FLAG = "{FLAGS['csp_bypass']}";</script>
      </body>
    </html>
    """))
    resp.headers["Content-Security-Policy"] = "script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com"
    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
