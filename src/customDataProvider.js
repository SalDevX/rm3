// customDataProvider.js
import dataProvider from "@refinedev/simple-rest";

// Extend the default dataProvider to customize the "show" behavior
const customDataProvider = {
  ...dataProvider("https://api.fake-rest.refine.dev"), // Use the default API endpoint for other resources
  getOne: async (resource, params) => {
    if (resource === "recipe_manager") {
      // Custom fetch for recipe show
      const response = await fetch(`http://127.0.0.1:5000/recipes/${params.id}`);
      const data = await response.json();
      return { data }; // Return the fetched recipe data
    }
    return dataProvider.getOne(resource, params); // Default behavior for other resources
  },
};

export default customDataProvider;
