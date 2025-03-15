from sqlalchemy import ForeignKey
from database import db

class Recipe(db.Model):
    __tablename__ = 'recipe'
    id = db.Column(db.Integer, primary_key=True)
    recipe_name = db.Column(db.String(255), nullable=False, server_default='Unnamed Recipe')
    recipe_total_cost = db.Column(db.Float, nullable=False, default=0.0)  # ✅ Ensure it has a default value
    ingredients = db.relationship('Ingredient', backref='recipe', lazy=True, cascade="all, delete", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "recipe_name": self.recipe_name,
            "total_cost": self.recipe_total_cost,  # ✅ Include total_cost
            "ingredients": [ingredient.to_dict() for ingredient in self.ingredients],
        }


class Ingredient(db.Model):
    __tablename__ = 'ingredient'
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, ForeignKey('recipe.id', ondelete="CASCADE"), nullable=False)
    item_name = db.Column(db.String(255), nullable=False)
    packaging_quantity = db.Column(db.Float, nullable=False)
    price_item = db.Column(db.Float, nullable=False)
    grams_recipe = db.Column(db.Float, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "item_name": self.item_name,
            "packaging_quantity": self.packaging_quantity,
            "price_item": self.price_item,
            "grams_recipe": self.grams_recipe,
            "total_cost": self.total_cost,
        }