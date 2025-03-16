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

# Add CORS configuration at the top of app.py
# CORS Configuration (Allow localhost + Heroku frontend)
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "https://recipe-manager3-d7093a765939.herokuapp.com",
            ]
        }
    },
)


# Database configuration
db_url = os.getenv("DATABASE_URL")
if db_url:
    parsed_url = urlparse(db_url)
    query_params = parse_qs(parsed_url.query)

    # Ensure sslmode=require is added correctly
    query_params["sslmode"] = ["require"]

    new_query = urlencode(query_params, doseq=True)
    db_url = urlunparse(parsed_url._replace(query=new_query))

app.config["SQLALCHEMY_DATABASE_URI"] = db_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Bind SQLAlchemy to Flask app
db.init_app(app)



# Initialize Flask-Migrate
migrate = Migrate(app, db)  # Add this line

# Enable CORS for all routes
CORS(app)

# ✅ Route for fetching recipes
# ✅ Route for fetching recipes
# Modify the get_recipes route



@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Recipe Manager API!"})


@app.route("/recipes", methods=["GET"])
def get_recipes():
    try:
        recipes = Recipe.query.order_by(Recipe.recipe_total_cost.desc()).all()
        for r in recipes:
            print(
                f"Recipe: {r.recipe_name}, Total Cost: {r.recipe_total_cost}"
            )  # Debugging

        return jsonify(
            [
                {
                    "id": r.id,
                    "recipe_name": r.recipe_name,
                    "section": r.section,
                    "total_cost": float(
                        r.recipe_total_cost
                    ),  # Change key to 'total_cost'
                }
                for r in recipes
            ]
        )

    except Exception as e:
        print(f"❌ Database error: {str(e)}")  # Debugging
        return jsonify({"error": "Failed to fetch recipes"}), 500

    # New route for fetching a single recipe along with its ingredients


@app.route("/recipes/<int:id>", methods=["GET"])
def get_recipe(id):
    try:
        recipe = Recipe.query.get(id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        ingredients = Ingredient.query.filter_by(recipe_id=id).all()

        # Calculate the total cost dynamically from ingredients
        total_cost = sum(ingredient.total_cost for ingredient in ingredients)

        # Serialize recipe and ingredients
        recipe_data = {
            "id": recipe.id,
            "recipe_name": recipe.recipe_name,
            "recipe_total_cost": float(total_cost),  # Ensure total_cost is a float
            "ingredients": [
                {
                    "id": ingredient.id,
                    "item_name": ingredient.item_name,
                    "packaging_quantity": ingredient.packaging_quantity,
                    "price_item": ingredient.price_item,
                    "grams_recipe": ingredient.grams_recipe,
                    "total_cost": float(
                        ingredient.total_cost
                    ),  # Ensure ingredient total cost is a float
                }
                for ingredient in ingredients
            ],
        }

        return jsonify(recipe_data)

    except Exception as e:
        print(f"❌ Error fetching recipe {id}: {str(e)}")  # Debugging
        return jsonify({"error": "Failed to fetch recipe"}), 500


# ✅ Route for deleting a recipe
@app.route("/recipes/<int:id>", methods=["DELETE"])
def delete_recipe(id):
    try:
        recipe = Recipe.query.get(id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Delete associated ingredients using relationship
        for ingredient in recipe.ingredients:
            db.session.delete(ingredient)

        db.session.delete(recipe)
        db.session.commit()
        return jsonify({"message": "Recipe deleted successfully!"}), 200

    except Exception as e:
        db.session.rollback()  # Add rollback on error
        print(f"❌ Database error: {str(e)}")
        return jsonify({"error": "Failed to delete recipe"}), 500


# ✅ Route for saving recipes
@app.route("/save-recipes", methods=["POST"])
def save_recipe():
    data = request.json
    recipe_name = data.get("recipe_name")
    section = data.get(
        "section", "Uncategorized"
    )  # Default to 'Uncategorized' if no section is provided
    ingredients = data.get("ingredients", [])

    # Calculate total cost from ingredients
    total_cost = sum(ing["total_cost"] for ing in ingredients)

    # Create and save recipe
    recipe = Recipe(
        recipe_name=recipe_name, recipe_total_cost=total_cost, section=section
    )
    db.session.add(recipe)
    db.session.commit()

    # Save ingredients with correct `recipe_id`
    for ing in ingredients:
        ingredient = Ingredient(
            recipe_id=recipe.id,
            item_name=ing["item_name"],
            packaging_quantity=ing["packaging_quantity"],
            price_item=ing["price_item"],
            grams_recipe=ing["grams_recipe"],
            total_cost=ing["total_cost"],
        )
        db.session.add(ingredient)

    db.session.commit()
    return jsonify({"message": "Recipe saved successfully!"}), 201

with app.app_context():
    from models import Recipe, Ingredient  # Explicit model import
    db.create_all()  # Create tables if not existing


# ✅ Run Flask app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
