// netlify/functions/get_coffee_blends/get_coffee_blends.mjs
import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);  // Using your environment variable for the connection
  try {
    // Replace this query with one that fetches data from your Neon database
    const rows = await sql('SELECT * FROM favorite_coffee_blends;');  

    return {
      statusCode: 200,
      body: JSON.stringify(rows),  // Respond with the fetched rows
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),  // Handle errors
    };
  }
}
