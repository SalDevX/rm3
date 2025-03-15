import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Ensure you have this import
import json5 from 'json5';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/recipes': 'http://127.0.0.1:5000',
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.json5'],
  },
  configureServer(server) {
    // Handling .json5 files in the server middleware
    server.middlewares.use((req, res, next) => {
      if (req.url?.endsWith('.json5')) {
        const json5FilePath = path.join(process.cwd(), req.url.slice(1)); // Assuming path starts from /
        if (fs.existsSync(json5FilePath)) {
          const fileContent = fs.readFileSync(json5FilePath, 'utf-8');
          const parsedContent = json5.parse(fileContent);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(parsedContent)); // Send back as JSON
        } else {
          res.statusCode = 404;
          res.end();
        }
      } else {
        next();
      }
    });
  },
});
