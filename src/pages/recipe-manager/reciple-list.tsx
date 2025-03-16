import React, { useState, useEffect } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { List, EditButton, ShowButton, DeleteButton } from "@refinedev/mui";
import { Link } from "react-router-dom"; // Import Link for navigation




interface Recipe {
  id: number;
  recipe_name: string;
  section: string;  // Add section property
  total_cost: number;
  total_cost_formatted: string;
}

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/recipes")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Raw API response:", data);

        if (!Array.isArray(data)) {
          console.error("❌ Expected an array but got:", data);
          setRecipes([]);
          return;
        }

        const formattedRecipes = data.map((recipe) => ({
          ...recipe,
          total_cost: Number(recipe.total_cost) || 0,
          total_cost_formatted: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 2,
          }).format(recipe.total_cost),
        }));

        setRecipes(formattedRecipes);
      })
      .catch((error) => {
        console.error("❌ Fetch error:", error);
        setRecipes([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const apiUrl = "http://127.0.0.1:5000"; // Make sure this points to your backend

  const deleteRecipe = (id: number) => {
    fetch(`${apiUrl}/recipes/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete recipe");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Deleted recipe:", data);
        // Update the state to reflect the deletion
        setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id));
        alert("Recipe deleted successfully!");
      })
      .catch((err) => {
        console.error("❌ Error deleting recipe:", err);
        alert("Error deleting recipe");
      });
  };

  const columns: GridColDef[] = [
    {
      field: "section",
      headerName: "Section",
      flex: 1,
      minWidth: 150,
      sortable: true, // Enable sorting
    },
    { field: "recipe_name", headerName: "Recipe Name", flex: 1, minWidth: 200 },
    {
      field: "total_cost_formatted",
      headerName: "Total Cost (IDR)",
      type: "string",
      minWidth: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      headerAlign: "right",
      minWidth: 180,
      sortable: false,
      renderCell: function render({ row }) {
        return (
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
          >
            <EditButton hideText recordItemId={row.id} />
            <ShowButton hideText recordItemId={row.id} />
            <DeleteButton
              hideText
              resource="recipes" // Add resource prop
              recordItemId={row.id}
              onClick={() => deleteRecipe(row.id)} // Trigger delete on button click
              onSuccess={() => {
                // Confirm ID matching by parsing to number
                setRecipes((prev) =>
                  prev.filter((recipe) => recipe.id !== Number(row.id))
                );
              }}
              onError={(error) => {
                console.error("Delete failed:", error);
                alert("Delete failed. Check console for details.");
              }}
            />
            
          </div>
        );
      },
    },
  ];

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error loading recipes: {error.message}</p>;

  return (
    <>
      <List>
        <DataGrid
          rows={recipes}
          columns={columns}
          autoHeight
          pageSizeOptions={[5, 10, 25]}
          getRowId={(row) => row.id}
        />
      </List>
    </>
  );
};

export default RecipeList;
