export default async (event, context) => {
    const HEROKU_URL = "https://your-heroku-app.herokuapp.com";
    const path = event.path.replace("/.netlify/functions/proxy", "");
    
    try {
      const response = await fetch(`${HEROKU_URL}${path}`, {
        headers: { 
          "Content-Type": "application/json",
          ...event.headers
        },
        method: event.httpMethod,
        body: event.body
      });
      
      return {
        statusCode: response.status,
        body: await response.text()
      };
    } catch (error) {
      return { statusCode: 500, body: error.message };
    }
  };