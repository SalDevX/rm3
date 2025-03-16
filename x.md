```py

# After db.init_app(app)
with app.app_context():
    from models import Recipe, Ingredient  # Explicit model import
    db.create_all()  # Create tables if not existing