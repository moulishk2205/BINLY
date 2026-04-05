from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image

# ✅ Fix 1: Safe import for WasteClassifier
try:
    from model import WasteClassifier
except Exception as e:
    print("❌ ERROR: model.py not found OR WasteClassifier not defined properly.")
    print("👉 Fix: Create model.py in same folder and define WasteClassifier class.")
    print("More info:", e)
    WasteClassifier = None


app = Flask(__name__)
CORS(app)

# ✅ Initialize classifier safely
classifier = WasteClassifier() if WasteClassifier else None


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "OK",
        "service": "Binly ML Service",
        "version": "1.0.0",
        "model_loaded": classifier is not None
    })


def decode_base64_image(image_data: str) -> Image.Image:
    """
    Decodes base64 image string into a PIL Image safely.
    Supports strings with prefix: data:image/png;base64,...
    """

    if not image_data or not isinstance(image_data, str):
        raise ValueError("Invalid image data")

    # Remove prefix if present
    if "," in image_data:
        image_data = image_data.split(",")[1]

    # Remove whitespace/newlines
    image_data = image_data.strip().replace("\n", "").replace("\r", "").replace(" ", "")

    # ✅ Fix 3: Add padding if missing
    missing_padding = len(image_data) % 4
    if missing_padding:
        image_data += "=" * (4 - missing_padding)

    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))

    if image.mode != "RGB":
        image = image.convert("RGB")

    return image


@app.route("/classify", methods=["POST"])
def classify():
    try:
        # ✅ Fix 2: Safe JSON extraction
        data = request.get_json(silent=True)

        if not data or "image" not in data:
            return jsonify({"error": "No image provided"}), 400

        if classifier is None:
            return jsonify({
                "error": "Model not loaded. Check model.py and WasteClassifier."
            }), 500

        image_data = data["image"]

        image = decode_base64_image(image_data)

        # Predict
        result = classifier.predict(image)

        return jsonify(result), 200

    except base64.binascii.Error:
        return jsonify({"error": "Invalid base64 encoding"}), 400

    except Exception as e:
        print(f"❌ Classification error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 50)
    print("🤖 Binly ML Service Starting")
    print("=" * 50)
    print("Service: http://localhost:5001")
    print("Health:  http://localhost:5001/health")
    print("=" * 50)

    # host=0.0.0.0 allows access by local network
    app.run(host="0.0.0.0", port=5001, debug=True)
