from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from flask_cors import CORS
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import os

app = Flask(__name__)
app.secret_key = '346c7dea2f49dea9b2a9949e207cfe15'

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Mail config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'mansihosting22@gmail.com'
app.config['MAIL_PASSWORD'] = 'mlzksnkfbuwytrkr'
app.config['MAIL_DEFAULT_SENDER'] = 'mansihosting22@gmail.com'
mail = Mail(app)

CORS(app)

# Folders
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['EDITED_FOLDER'] = 'static/edited'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['EDITED_FOLDER'], exist_ok=True)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

with app.app_context():
    db.create_all()

# Helpers
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']

        if User.query.filter_by(username=username).first():
            return 'Username already exists!'

        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        # Send email
        try:
            if email:
                msg = Message(
                    "Registration Successful",
                    recipients=[email]
                )
                login_url = "http://127.0.0.1:5000"  # Replace with your actual login page URL

                msg.body = f"""Hello {username},
                Congratulations! You have successfully registered for Luvima Advanced Image Editor.
                You can now log in to your account using the following link:{login_url}
                Here are some tips to get started:
                - Upload and edit your images easily
                - Apply filters, crop, rotate, and remove backgrounds
                - Save and download your edited images
                We’re excited to have you on board!
                Happy editing,
                The Luvima Team"""
                
                mail.send(msg)
        except Exception as e:
            print("Email sending failed:", e)

        # Redirect to login page with a success message
        return redirect(url_for('login', message='Account created successfully!'))

    return render_template('sign_up.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    message = request.args.get('message', '')
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            session['username'] = username
            return redirect(url_for('main'))
        else:
            message = 'Invalid username or password'

    return render_template('login.html', message=message)


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login', message='Logged out successfully'))

@app.route('/main')
def main():
    if 'username' in session:
        return render_template('main.html', username=session['username'])
    return redirect(url_for('login'))

@app.route('/signup')
def signup():
    return render_template("sign_up.html")

# Image editing routes (same as before)
@app.route('/apply_filter', methods=['POST'])
def apply_filter():
    filename = request.form['filename']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    img = Image.open(filepath)

    brightness = float(request.form.get('brightness', 1))
    contrast = float(request.form.get('contrast', 1))
    saturation = float(request.form.get('saturation', 1))
    blur = float(request.form.get('blur', 0))
    rotation = int(request.form.get('rotation', 0))
    flip_horizontal = request.form.get('flip_horizontal') == 'true'
    flip_vertical = request.form.get('flip_vertical') == 'true'

    if brightness != 1:
        img = ImageEnhance.Brightness(img).enhance(brightness)
    if contrast != 1:
        img = ImageEnhance.Contrast(img).enhance(contrast)
    if saturation != 1:
        img = ImageEnhance.Color(img).enhance(saturation)
    if blur > 0:
        img = img.filter(ImageFilter.GaussianBlur(radius=blur))
    if rotation:
        img = img.rotate(rotation, expand=True)
    if flip_horizontal:
        img = ImageOps.mirror(img)
    if flip_vertical:
        img = ImageOps.flip(img)

    edited_filename = 'edited_' + filename
    edited_path = os.path.join(app.config['EDITED_FOLDER'], edited_filename)
    img.save(edited_path)

    return jsonify({'url': url_for('static', filename=f'edited/{edited_filename}')})

@app.route('/crop', methods=['POST'])
def crop_image():
    filename = request.form['filename']
    x = int(request.form['x'])
    y = int(request.form['y'])
    width = int(request.form['width'])
    height = int(request.form['height'])

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    img = Image.open(filepath)
    cropped_img = img.crop((x, y, x + width, y + height))

    cropped_filename = 'cropped_' + filename
    cropped_path = os.path.join(app.config['EDITED_FOLDER'], cropped_filename)
    cropped_img.save(cropped_path)

    return jsonify({'url': url_for('static', filename=f'edited/{cropped_filename}')})

@app.route('/remove_bg', methods=['POST'])
def remove_bg():
    return jsonify({'message': 'Background removal requires AI integration.'})

if __name__ == '__main__':
    app.run(debug=True)
