from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid

from mapres import Mapres
from controller import FileSystemDB
from flask import send_file
from io import BytesIO


app = Flask(__name__)
CORS(app, resources={r"/mapres/image/*": {"origins": "*"}})
CORS(app, resources={r"/mapres/variant/*": {"origins": "*"}})
CORS(app, resources={r"/mapres/rules/*": {"origins": "*"}})
CORS(app, resources={r"/mapres/example/*": {"origins": "*"}})
CORS(app, resources={r"/mapres": {"origins": "*"}})
CORS(app, resources={r"/upload": {"origins": "*"}})
CORS(app, resources={r"/delete/*": {"origins": "*"}})
CORS(app, resources={r"/check_auth": {"origins": "*"}})
UPLOAD_DIR = 'uploads'
fs = FileSystemDB(UPLOAD_DIR)

# Yes this is really lazy, todo: fix asap
PASSWORD = "test"

ALLOWED_IMAGE_EXT = {'.png'}
ALLOWED_RULES_EXT = {'.rules'}
def allowed_file(filename, allowed_exts):
    return os.path.splitext(filename)[1].lower() in allowed_exts

@app.route('/')
def home():
    return 'Hello World - flask server for teeDB'

def handle_upload(req):
    name = req.form.get("name")
    author = req.form.get("author")
    tags = req.form.getlist("tags")
    if not name:
        return {"error": "Missing 'name' field"}, 400

    main_key = f"{name}.png"
    main_file = req.files.get(main_key)
    if not main_file:
        return {"error": f"Missing required file '{main_key}'"}, 400
    if not allowed_file(main_file.filename, ALLOWED_IMAGE_EXT):
        return {"error": f"File '{main_key}' must be a .png"}, 400

    rules_key = f"{name}.rules"
    rules_file = req.files.get(rules_key)
    if rules_file and not allowed_file(rules_file.filename, ALLOWED_RULES_EXT):
        return {"error": f"File '{rules_key}' must be a .rules file"}, 400

    example_key = f"{name}_example.png"
    example_file = req.files.get(example_key)
    if example_file and not allowed_file(example_file.filename, ALLOWED_IMAGE_EXT):
        return {"error": f"File '{example_key}' must be a .png"}, 400

    # Handle variant files
    variants = []
    variant_index = 1
    while True:
        variant_key = f"{name}_variant_{variant_index}.png"
        variant_file = req.files.get(variant_key)
        if not variant_file:
            break
        if not allowed_file(variant_file.filename, ALLOWED_IMAGE_EXT):
            return {"error": f"Variant file '{variant_key}' must be a .png"}, 400
        variants.append({
            "filename": secure_filename(variant_file.filename),
            "content": variant_file.read()
        })
        variant_index += 1

    result = {
        "name": name,
        "main": {
            "filename": secure_filename(main_file.filename),
            "content": main_file.read()
        },
        "rules": None,
        "example": None,
        "variants": variants if variants else None,
        "author": author if author else "Unknown",
        "tags": tags if tags else []
    }

    if rules_file:
        result["rules"] = {
            "filename": secure_filename(rules_file.filename),
            "content": rules_file.read()
        }

    if example_file:
        result["example"] = {
            "filename": secure_filename(example_file.filename),
            "content": example_file.read()
        }

    return result, 200

@app.route("/upload", methods=["POST"])
def upload():
    key = request.args.get("key")
    if not key or key != PASSWORD:
        return jsonify({"error": "No access"}), 403
    files, status_code = handle_upload(request)
    if status_code != 200:
        return jsonify(files), status_code

    print("Upload received:")
    print("Name:", files["name"])
    print("Main file size:", len(files["main"]["content"]))
    if files["rules"]:
        print("Rules file size:", len(files["rules"]["content"]))
    if files["variants"]:
        print("Variant files:", len(files["variants"]))

    fs.create_mapres(files)

    response = {
        "status": "received",
        "main_filename": files["main"]["filename"],
        "rules_filename": files["rules"]["filename"] if files["rules"] else None
    }
    
    if files["variants"]:
        response["variant_count"] = len(files["variants"])

    return jsonify(response), 200

@app.route("/delete/<string:mapres_name>", methods=["DELETE"])
def delete_mapres(mapres_name):
    key = request.args.get("key")
    if not mapres_name:
        return jsonify({"error": "Missing 'mapres_name' parameter"}), 400
    if not key or key != PASSWORD:
        return jsonify({"error": "No access"}), 403

    fs.delete_mapres(mapres_name)
    return jsonify({"status": "deleted", "mapres_name": mapres_name}), 200

@app.route("/mapres", methods=["GET"])
def get_mapres():
    mapres_dict = {k: v for k, v in fs.mapres_dict.items()}
    for name in mapres_dict:
        mapres = mapres_dict[name]
        mapres_dict[name] = mapres.to_dict()
    return jsonify(mapres_dict), 200

@app.route("/mapres/image/<string:mapres_name>", methods=["GET"])
def get_mapres_image(mapres_name):
    image_path = os.path.join(UPLOAD_DIR, mapres_name, f"{mapres_name}.png")
    if not os.path.isfile(image_path):
        return jsonify({"error": "Mapres image not found"}), 404
    return send_file(image_path, mimetype="image/png", download_name=f"{mapres_name}.png")

@app.route("/mapres/variant/<string:mapres_name>/<int:variant_index>", methods=["GET"])
def get_mapres_variant(mapres_name, variant_index):
    variant_filename = f"{mapres_name}_variant_{variant_index}.png"
    variant_path = os.path.join(UPLOAD_DIR, mapres_name, variant_filename)
    if not os.path.isfile(variant_path):
        return jsonify({"error": "Mapres variant not found"}), 404
    return send_file(variant_path, mimetype="image/png", download_name=variant_filename)

@app.route("/mapres/example/<string:mapres_name>", methods=["GET"])
def get_mapres_example(mapres_name):
    image_path = os.path.join(UPLOAD_DIR, mapres_name, f"{mapres_name}_example.png")
    if not os.path.isfile(image_path):
        return jsonify({"error": "Mapres example image not found"}), 404
    return send_file(image_path, mimetype="image/png", download_name=f"{mapres_name}_example.png")

@app.route("/mapres/rules/<string:mapres_name>", methods=["GET"])
def get_mapres_rules(mapres_name):
    rules_path = os.path.join(UPLOAD_DIR, mapres_name, f"{mapres_name}.rules")
    if not os.path.isfile(rules_path):
        return jsonify({"error": "Mapres rules not found"}), 404
    return send_file(rules_path, mimetype="text/plain", download_name=f"{mapres_name}.rules")

@app.route("/check_auth", methods=["GET"])
def check_auth():
    key = request.args.get("key")
    if not key or key != PASSWORD:
        return jsonify({"error": "No access"}), 403
    return jsonify({"status": "authorized"}), 200

if __name__ == '__main__':
    app.run(debug=True)


