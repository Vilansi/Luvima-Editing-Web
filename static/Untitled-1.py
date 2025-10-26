from flask import Flask, request, render_template_string, send_file
import requests
from io import BytesIO
from PIL import Image

app = Flask(__name__)

API_KEY = "uCxwzNAbF71DeQQZyeg7YWrn"

HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Remove BG & Add Color</title>
<style>
body { text-align: center; font-family: Arial; margin: 50px; }
input, button { margin: 10px; padding: 5px 10px; }
canvas { margin-top: 20px; border: 1px solid #ccc; }
</style>
</head>
<body>

<h1>Remove Background & Add Color</h1>
<form method="POST" enctype="multipart/form-data">
  <input type="file" name="image" required><br>
  <label>Background Color:</label>
  <input type="color" name="bgcolor" value="#ffffff"><br>
  <button type="submit">Remove Background</button>
</form>

{% if result_image %}
<canvas id="canvas"></canvas>
<img id="downloadImg" src="{{ result_image }}" style="display:none;">
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = document.getElementById('downloadImg');
img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = "{{ bgcolor }}";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0);
};
</script>
<a href="{{ result_image }}" download="result.png">Download Image</a>
{% endif %}

</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def index():
    result_image = None
    bgcolor = "#ffffff"
    if request.method == "POST":
        file = request.files["image"]
        bgcolor = request.form.get("bgcolor", "#ffffff")

        # Call remove.bg API
        response = requests.post(
            "https://api.remove.bg/v1.0/removebg",
            headers={"X-Api-Key": API_KEY},
            files={"image_file": file},
            data={"size": "auto"},
        )

        if response.status_code == 200:
            img = Image.open(BytesIO(response.content)).convert("RGBA")
            buf = BytesIO()
            img.save(buf, format="PNG")
            buf.seek(0)
            import base64
            result_image = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
        else:
            return f"Error: {response.status_code} {response.text}"

    return render_template_string(HTML, result_image=result_image, bgcolor=bgcolor)

if __name__ == "__main__":
    app.run(debug=True)
