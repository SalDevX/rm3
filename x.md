```py

import sys
import os

# Ensure the correct path is set before importing modules
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from database import db
from models import Recipe, Ingredient
from flask_migrate import Migrate
from sqlalchemy import func
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

# Load .env only in development
if os.getenv("FLASK_ENV") != "production":
    load_dotenv()

# Flask app setup
app = Flask(__name__)

# CORS Configuration (Allow localhost + your Heroku frontend)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://your-heroku-app.herokuapp.com"]}})


CORS(app, resources={r"/recipes/*": {"origins": ["http://localhost:3000", "https://your-actual-heroku-app-url.herokuapp.com"]}})


# Set up the database URI from environment variables
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")  # Ensure DATABASE_URL is set in Heroku
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

# Example route
@app.route("/")
def home():
    return jsonify({"message": "Recipe Manager API is running!"})

if __name__ == "__main__":
    app.run(debug=True)
