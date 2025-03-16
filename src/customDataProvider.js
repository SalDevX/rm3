// customDataProvider.js
import dataProvider from "@refinedev/simple-rest";

// Extend the default dataProvider to customize the "show" behavior
const customDataProvider = {
  ...dataProvider("https://api.fake-rest.refine.dev"), // Use the default API endpoint for other resources
  getOne: async (resource, params) => {
    if (resource === "recipe_manager") {
      // Check if we are in development or production
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? `http://127.0.0.1:5000/recipes/${params.id}` // Local development
          : `/.netlify/functions/proxy/recipes/${params.id}`; // Production via Netlify function

      // Fetch data from the appropriate URL
      const response = await fetch(apiUrl);
      const data = await response.json();
      return { data }; // Return the fetched recipe data
    }

    // For all other resources, use the default behavior
    return dataProvider.getOne(resource, params); 
  },
};

export default customDataProvider;
