from flask import Flask, request, jsonify, send_file
import os
import base64

app = Flask(__name__)

FLAGS = {
    "traversal": os.environ.get("FLAG_31", os.environ.get("FLAG", "WEBSEC{dot_dot_slash_etc_passwd_read}")),
    "absolute": os.environ.get("FLAG_32", os.environ.get("FLAG", "WEBSEC{absolute_path_proc_self_environ_leaked}")),
    "extension_append": os.environ.get("FLAG_33", os.environ.get("FLAG", "WEBSEC{null_byte_path_traversal_escaped}")),
    "avatar_upload": os.environ.get("FLAG_34", os.environ.get("FLAG", "WEBSEC{unrestricted_php_upload_web_shell_fired}")),
    "client_mime": os.environ.get("FLAG_35", os.environ.get("FLAG", "WEBSEC{client_mime_type_spoofed_bypass}")),
    "double_ext": os.environ.get("FLAG_36", os.environ.get("FLAG", "WEBSEC{double_extension_shell_php_jpg}")),
    "lfi_poison": os.environ.get("FLAG_37", os.environ.get("FLAG", "WEBSEC{lfi_access_log_poisoning_command_exec}")),
    "zip_slip": os.environ.get("FLAG_38", os.environ.get("FLAG", "WEBSEC{zip_slip_relative_path_overwrite}")),
    "rfi_sim": os.environ.get("FLAG_39", os.environ.get("FLAG", "WEBSEC{rfi_remote_wrapper_eval_code_executed}")),
    "polyglot": os.environ.get("FLAG_40", os.environ.get("FLAG", "WEBSEC{polyglot_image_metadata_rce_unlocked}"))
}

DOCS_DIR = "/tmp/docs"
UPLOADS_DIR = "/tmp/uploads"
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

with open(os.path.join(DOCS_DIR, "report.pdf"), "w") as f:
    f.write("Q1 Security Evaluation Report - Safe Content.")

@app.route("/")
def home():
    return jsonify({
        "suite": "WebSec CTF - File Handling & Path Traversal Practice Lab",
        "category": "file-handling-path-traversal",
        "challenges_covered": "31-40"
    })

# Challenge 31: Basic Directory Traversal
@app.route("/view")
def view_file():
    filename = request.args.get("file", "report.pdf")
    if "../" in filename:
        if "etc/passwd" in filename or "passwd" in filename:
            return jsonify({
                "path": filename,
                "content": f"root:x:0:0:root:/root:/bin/bash\nctf:{FLAGS['traversal']}:1000:1000::/home/ctf:/bin/sh"
            })
    return jsonify({"file": filename, "status": "read_ok"})

# Challenge 32: Absolute Path File Disclosure
@app.route("/report")
def absolute_path():
    path = request.args.get("path", "")
    if path == "/proc/self/environ" or path == "/flag.txt":
        return jsonify({
            "path": path,
            "environ": f"PATH=/usr/local/bin;APP_FLAG={FLAGS['absolute']};HOSTNAME=websec-worker-01"
        })
    return jsonify({"error": "File not found"}), 404

# Challenge 33: Path Traversal with Extension Append
@app.route("/doc")
def ext_append():
    name = request.args.get("name", "")
    if "%00" in name or "\x00" in name or "../" in name:
        return jsonify({"content": f"127.0.0.1 localhost\n# Flag: {FLAGS['extension_append']}"})
    return jsonify({"file": f"{name}.pdf", "status": "loaded"})

# Challenge 34: Unrestricted Avatar Upload
@app.route("/upload/avatar", methods=["POST"])
def upload_avatar():
    file = request.files.get("avatar")
    if file:
        fname = file.filename
        if fname.endswith(".php") or fname.endswith(".py"):
            return jsonify({
                "status": "uploaded",
                "url": f"/uploads/{fname}",
                "shell_executed": True,
                "output": FLAGS["avatar_upload"]
            })
    return jsonify({"status": "avatar_saved"})

# Challenge 35: Client-Side Only Upload Filter
@app.route("/upload/client", methods=["POST"])
def upload_client():
    file = request.files.get("file")
    if file and (file.filename.endswith(".php") or file.filename.endswith(".sh")):
        return jsonify({"success": True, "flag": FLAGS["client_mime"]})
    return jsonify({"success": True})

# Challenge 36: Double Extension
@app.route("/upload/double", methods=["POST"])
def upload_double():
    file = request.files.get("file")
    if file:
        parts = file.filename.lower().split(".")
        if len(parts) >= 3 and parts[-2] == "php" and parts[-1] in ["jpg", "png"]:
            return jsonify({"success": True, "executed": True, "flag": FLAGS["double_ext"]})
    return jsonify({"success": True})

# Challenge 37: LFI to Log Poisoning
@app.route("/lfi")
def lfi_poison():
    page = request.args.get("page", "")
    cmd = request.args.get("c", "")
    if "access.log" in page:
        return jsonify({
            "included": page,
            "command_executed": cmd or "whoami",
            "flag": FLAGS["lfi_poison"]
        })
    return jsonify({"included": page})

# Challenge 38: Zip Slip
@app.route("/extract", methods=["POST"])
def zip_slip():
    file = request.files.get("archive")
    if file:
        # Check if archive entry name contains ../
        return jsonify({"extracted": True, "flag": FLAGS["zip_slip"]})
    return jsonify({"extracted": False}), 400

# Challenge 39: RFI Simulation
@app.route("/include")
def rfi_sim():
    uri = request.args.get("file", "")
    if uri.startswith("data://") or uri.startswith("php://"):
        return jsonify({
            "stream_evaluated": True,
            "flag": FLAGS["rfi_sim"]
        })
    return jsonify({"included": uri})

# Challenge 40: Polyglot Upload
@app.route("/upload/polyglot", methods=["POST"])
def upload_polyglot():
    file = request.files.get("image")
    if file:
        content = file.read()
        # Valid GIF header + PHP code
        if content.startswith(b"GIF89a") and (b"<?php" in content or b"<?" in content):
            return jsonify({
                "valid_image": True,
                "polyglot_executed": True,
                "flag": FLAGS["polyglot"]
            })
    return jsonify({"error": "Invalid image structure"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
