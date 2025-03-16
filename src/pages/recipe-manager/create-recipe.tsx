import React, { useState, useEffect } from "react";
import axios from "axios";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

// Register all Handsontable modules
import { registerAllModules } from "handsontable/registry";
registerAllModules();

interface Ingredient {
  item_name: string;
  packaging_quantity: number;
  price_item: number;
  grams_recipe: number;
  total_cost?: number;
}

const RecipeTable: React.FC = () => {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Recipe Name', width: 200 },
    { field: 'section', headerName: 'Section', width: 150 }, // Add section column
    { field: 'ingredients', headerName: 'Ingredients', width: 300 },
  ];

  const rows: GridRowsProp = [
    { id: 1, name: 'Recipe 1', ingredients: 'ingredient1, ingredient2' },
    { id: 2, name: 'Recipe 2', ingredients: 'ingredient1, ingredient3' },
    // More rows...
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5} // Default page size
        pageSizeOptions={[5, 10, 25, 50, 100]} // Available page size options
        // Type assertion to bypass type checking for the `pageSize`
        {...({ pageSize: 5 } as any)}
      />
    </div>
  );
};

const CreateRecipe: React.FC = () => {
  const [recipeName, setRecipeName] = useState<string>("");
  const [section, setSection] = useState(''); // Manage section state
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item_name: "", packaging_quantity: 0, price_item: 0, grams_recipe: 0, total_cost: 0 },
  ]);

  const [totalCost, setTotalCost] = useState<number>(0); // To hold the total cost of ingredients

  // Function to calculate the total cost dynamically
  const calculateTotalCost = () => {
    const sum = ingredients.reduce((acc, ingredient) => {
      const price = parseFloat(ingredient.price_item.toString().replace(/[^\d.-]/g, "")) || 0;
      const packaging = parseFloat(ingredient.packaging_quantity.toString().replace(/,/g, "")) || 1;
      const grams = parseFloat(ingredient.grams_recipe.toString().replace(/,/g, "")) || 0;
      return acc + (price / packaging) * grams;
    }, 0);
    setTotalCost(sum);
  };

  // Update total cost whenever ingredients change
  useEffect(() => {
    calculateTotalCost();
  }, [ingredients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    

    const formattedIngredients = ingredients.map((ing) => ({
      ...ing,
      packaging_quantity: ing.packaging_quantity || 1,
      total_cost: (ing.price_item / (ing.packaging_quantity || 1)) * ing.grams_recipe,
    }));
    

    const ingredientsForSave = formattedIngredients.map((ingredient) => ({
      item_name: ingredient.item_name,
      packaging_quantity: ingredient.packaging_quantity,
      price_item: ingredient.price_item,
      grams_recipe: ingredient.grams_recipe,
      total_cost: ingredient.total_cost || 0,
    }));

    const recipeTotalCost = formattedIngredients.reduce((acc, ing) => acc + ing.total_cost, 0);

  const formattedData = {
    recipe_name: recipeName,
    section: section,  // Ensure section is included
    recipe_total_cost: recipeTotalCost,  // 🔹 Send calculated total cost
    ingredients: formattedIngredients,
  };

  console.log("Formatted Ingredients:", formattedIngredients);

  try {
    console.log("Calculated Recipe Total Cost:", recipeTotalCost);
    await axios.post("http://127.0.0.1:5000/save-recipes", formattedData);
    alert("Recipe saved successfully!");
    setRecipeName("");
    setSection("");  // Reset section field
    setIngredients([{ item_name: "", packaging_quantity: 0, price_item: 0, grams_recipe: 0, total_cost: 0 }]);
    setTotalCost(0); // Reset total cost
  } catch (error) {
    alert("Error saving recipe: " + (error as any).message);
  }
};

  return (
    <div>
      <h2>Create Recipe</h2>
      <form onSubmit={handleSubmit}>
      <label>Section:</label>
        <input
          type="text"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          required
        />
        <label>Recipe Name:</label>
        <input
          type="text"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          required
        />
      

        <h3>Ingredients</h3>

        <HotTable
          data={ingredients}
          colHeaders={["Item Name", "Packaging Qty", "Price (IDR)", "Grams", "Total Cost (IDR)"]}
          rowHeaders={true}
          manualColumnResize={true}
          manualRowResize={true}
          stretchH="all"
          width="100%"
          height="auto"
          licenseKey="non-commercial-and-evaluation"
          columns={[
            { data: "item_name", type: "text" },
            { 
              data: "packaging_quantity", 
              type: "numeric", 
              numericFormat: { pattern: "0,0" } 
            },
            { 
              data: "price_item", 
              type: "numeric", 
              numericFormat: { pattern: "IDR 0,0" },
              correctFormat: true,
            },
            { 
              data: "grams_recipe", 
              type: "numeric", 
              numericFormat: { pattern: "0,0" } 
            },
            { 
              data: "total_cost", 
              type: "numeric", 
              readOnly: true, 
              numericFormat: { pattern: "IDR 0,0" },
              renderer: (instance, td, row) => {
                const rowData = instance.getSourceDataAtRow(row) as Ingredient | undefined;
                if (rowData) {
                  const price = parseFloat(rowData.price_item.toString().replace(/[^\d.-]/g, "")) || 0;
                  const packaging = parseFloat(rowData.packaging_quantity.toString().replace(/,/g, "")) || 1;
                  const grams = parseFloat(rowData.grams_recipe.toString().replace(/,/g, "")) || 0;
                  const total = (price / packaging) * grams;
                  td.innerText = `IDR ${total.toLocaleString("id-ID")}`;
                }
              },
            },
          ]}
          afterChange={(changes, source) => {
            if (source === "edit" && changes) {
              setIngredients((prev) => {
                const updated = [...prev];
                changes.forEach(([row, prop, oldValue, newValue]) => {
                  if (typeof prop === "string") {
                    updated[row] = { ...updated[row], [prop]: newValue };

                    // Ensure raw numbers are used
                    const price = parseFloat(updated[row].price_item.toString().replace(/[^\d.-]/g, "")) || 0;
                    const packaging = parseFloat(updated[row].packaging_quantity.toString().replace(/,/g, "")) || 1;
                    const grams = parseFloat(updated[row].grams_recipe.toString().replace(/,/g, "")) || 0;

                    updated[row].total_cost = (price / packaging) * grams;
                  }
                });
                return updated;
              });
            }
          }}
        />

        <button
          type="button"
          onClick={() =>
            setIngredients([
              ...ingredients,
              { item_name: "", packaging_quantity: 0, price_item: 0, grams_recipe: 0, total_cost: 0 },
            ])
          }
        >
          Add Ingredient
        </button>
    
        <button type="submit">Save Recipe</button>
      </form>
      <div style={{ marginTop: "20px", fontSize: "18px", fontWeight: "bold", textAlign: "right" }}>
      Total Recipe Cost: IDR {totalCost.toLocaleString("id-ID")}

</div>

    </div>
  
  );
};

export default CreateRecipe;
