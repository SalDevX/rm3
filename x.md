Okay, let's see. Your code is mostly correct, but there are a couple of issues:  

### **Fix These Issues**
1. **Indentation Error in the Home Route**  
   ```python
   @app.route("/", methods=["GET"])
   def home():
       return jsonify({"message": "Welcome to the Recipe Manager API!"})
   ```
   - You have an extra space before `@app.route("/")`, which will cause an `IndentationError`. Remove it.

2. **Duplicate `CORS(app)` Call**  
   - You’re calling `CORS(app)` twice. Remove the second call (`CORS(app)`) after `migrate = Migrate(app, db)`.

3. **Use `session.rollback()` for Safety**  
   - In `save_recipe()`, if anything goes wrong after adding the recipe but before adding ingredients, the database will have an incomplete record.  
   - Fix it by wrapping it in a `try-except`:
     ```python
     try:
         recipe = Recipe(recipe_name=recipe_name, recipe_total_cost=total_cost, section=section)
         db.session.add(recipe)
         db.session.commit()  # Commit the recipe first to get the ID

         for ing in ingredients:
             ingredient = Ingredient(
                 recipe_id=recipe.id,
                 item_name=ing["item_name"],
                 packaging_quantity=ing["packaging_quantity"],
                 price_item=ing["price_item"],
                 grams_recipe=ing["grams_recipe"],
                 total_cost=ing["total_cost"]
             )
             db.session.add(ingredient)

         db.session.commit()
         return jsonify({"message": "Recipe saved successfully!"}), 201
     except Exception as e:
         db.session.rollback()  # Rollback if anything fails
         print(f"❌ Error saving recipe: {str(e)}")
         return jsonify({"error": "Failed to save recipe"}), 500
     ```

4. **Ensure Your Migrations Are Up to Date**  
   - Run this before redeploying to Heroku:
     ```bash
     flask db migrate -m "Ensure latest changes"
     flask db upgrade
     ```

### **Final Steps**  
✅ **Fix the indentation issue**  
✅ **Remove the duplicate `CORS(app)`**  
✅ **Wrap `save_recipe()` in `try-except` with rollback**  
✅ **Run migrations (`flask db migrate && flask db upgrade`)**  

After that, redeploy and check if everything works! 🚀