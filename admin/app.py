#!/usr/bin/env python3
"""
Quick Post Admin Panel for Byteden Games Hugo site.
Run with: python admin/app.py
Access at: http://localhost:5000
"""

import os
import subprocess
from datetime import datetime
from pathlib import Path
from io import BytesIO
import base64

from flask import Flask, request, jsonify, render_template, send_from_directory
from PIL import Image
from dateutil import tz

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100MB max upload

PROJECT_ROOT = Path(__file__).parent.parent
CONTENT_DIR = PROJECT_ROOT / "content" / "post"
IMAGES_DIR = PROJECT_ROOT / "static" / "images"

MAX_IMAGE_WIDTH = 1920
WEBP_QUALITY = 85


def get_local_timezone():
    return tz.tzlocal()


def generate_filename():
    now = datetime.now(get_local_timezone())
    return now.strftime("%Y-%m-%d-%H-%M-%S")


def process_image(image_data, original_filename):
    img = Image.open(BytesIO(image_data))

    if img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    if img.width > MAX_IMAGE_WIDTH:
        ratio = MAX_IMAGE_WIDTH / img.width
        new_height = int(img.height * ratio)
        img = img.resize((MAX_IMAGE_WIDTH, new_height), Image.Resampling.LANCZOS)

    filename = f"{generate_filename()}.webp"
    output_path = IMAGES_DIR / filename
    img.save(output_path, "WEBP", quality=WEBP_QUALITY)

    return filename


def create_post(content, image_filename=None):
    now = datetime.now(get_local_timezone())
    filename = f"{generate_filename()}.md"
    filepath = CONTENT_DIR / filename

    iso_time = now.isoformat()

    frontmatter = f"""---
created: {iso_time}
modified: {iso_time}
---

"""

    post_content = content.strip()

    if image_filename:
        post_content += f"\n\n![](/images/{image_filename})"

    full_content = frontmatter + post_content + "\n"

    filepath.write_text(full_content, encoding="utf-8")

    return filename


def git_commit_and_push(post_filename, image_filename=None):
    files_to_add = [f"content/post/{post_filename}"]
    if image_filename:
        files_to_add.append(f"static/images/{image_filename}")

    subprocess.run(["git", "add"] + files_to_add, cwd=PROJECT_ROOT, check=True)

    commit_msg = f"New post: {post_filename}"
    subprocess.run(["git", "commit", "-m", commit_msg], cwd=PROJECT_ROOT, check=True)

    subprocess.run(["git", "push"], cwd=PROJECT_ROOT, check=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/post", methods=["POST"])
def create_new_post():
    try:
        content = request.form.get("content", "").strip()
        image_data = None
        image_filename = None

        if not content:
            return jsonify({"error": "Content is required"}), 400

        if "image" in request.files:
            file = request.files["image"]
            if file.filename:
                image_data = file.read()

        if not image_data and request.form.get("image_base64"):
            b64_data = request.form.get("image_base64")
            if "," in b64_data:
                b64_data = b64_data.split(",")[1]
            image_data = base64.b64decode(b64_data)

        if image_data:
            image_filename = process_image(image_data, "pasted_image")

        post_filename = create_post(content, image_filename)

        should_push = request.form.get("push", "false").lower() == "true"
        if should_push:
            git_commit_and_push(post_filename, image_filename)

        return jsonify(
            {
                "success": True,
                "post_filename": post_filename,
                "image_filename": image_filename,
                "pushed": should_push,
            }
        )

    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Git operation failed: {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/preview", methods=["POST"])
def preview_image():
    try:
        image_data = None

        if "image" in request.files:
            file = request.files["image"]
            if file.filename:
                image_data = file.read()

        if not image_data and request.form.get("image_base64"):
            b64_data = request.form.get("image_base64")
            if "," in b64_data:
                b64_data = b64_data.split(",")[1]
            image_data = base64.b64decode(b64_data)

        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        img = Image.open(BytesIO(image_data))
        original_size = len(image_data)
        original_dimensions = f"{img.width}x{img.height}"

        if img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        if img.width > MAX_IMAGE_WIDTH:
            ratio = MAX_IMAGE_WIDTH / img.width
            new_height = int(img.height * ratio)
            img = img.resize((MAX_IMAGE_WIDTH, new_height), Image.Resampling.LANCZOS)

        buffer = BytesIO()
        img.save(buffer, "WEBP", quality=WEBP_QUALITY)
        processed_data = buffer.getvalue()
        processed_size = len(processed_data)
        processed_dimensions = f"{img.width}x{img.height}"

        preview_b64 = base64.b64encode(processed_data).decode("utf-8")

        return jsonify(
            {
                "preview": f"data:image/webp;base64,{preview_b64}",
                "original_size": original_size,
                "processed_size": processed_size,
                "original_dimensions": original_dimensions,
                "processed_dimensions": processed_dimensions,
                "compression_ratio": f"{(1 - processed_size / original_size) * 100:.1f}%",
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 50)
    print("QUICK POST ADMIN - LOCALHOST ONLY")
    print("DO NOT DEPLOY THIS TO A PUBLIC SERVER")
    print("=" * 50)
    print(f"Running at http://localhost:5050")
    print(f"Project root: {PROJECT_ROOT}")
    app.run(host="127.0.0.1", debug=False, port=5050)
