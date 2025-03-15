import React, { useEffect, useState } from "react";
import { Stack, Typography, CircularProgress, Divider, List, ListItem, ListItemText } from "@mui/material"; // Correct import
import { useParams } from "react-router-dom"; // to get the recipe ID from the URL



import { useShow } from "@refinedev/core";
import { Show, TextFieldComponent as TextField } from "@refinedev/mui";

interface Ingredient {
  id: number;
  item_name: string;
  packaging_quantity: string;
  price_item: number;
  grams_recipe: number;
  total_cost: number;
}

interface Recipe {
  id: number;
  recipe_name: string;
  recipe_total_cost: number;
  ingredients: Ingredient[];
}

export const RecipeShow = () => {
  const { recordId } = useParams(); // Get the recipe ID from URL
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recipe and ingredients by ID
    if (recordId) {
      fetch(`http://127.0.0.1:5000/recipes/${recordId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error fetching recipe: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setRecipe(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading recipe:", error);
          setLoading(false);
        });
    }
  }, [recordId]);

  if (loading) return <CircularProgress />;

  if (!recipe) return <Typography variant="body1">Recipe not found!</Typography>;

  // Format numbers with thousand separators, using IDR currency and correct formatting
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Stack gap={2}>
    <Typography variant="h5">{recipe.recipe_name}</Typography>
    <Typography variant="body1" fontWeight="bold">
      Total Cost: {recipe.recipe_total_cost && !isNaN(Number(recipe.recipe_total_cost)) ? `Rp ${formatCurrency(Number(recipe.recipe_total_cost))}` : "Not Available"}
    </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Ingredients</Typography>
      <List>
        {recipe.ingredients.map((ingredient) => (
          <ListItem key={ingredient.id}>
            <ListItemText
              primary={ingredient.item_name}
              secondary={`Quantity: ${ingredient.packaging_quantity}, Price: Rp ${formatCurrency(ingredient.price_item)}, Grams: ${ingredient.grams_recipe}, Total Cost: Rp ${formatCurrency(ingredient.total_cost)}`}
            />
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};


