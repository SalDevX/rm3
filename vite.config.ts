import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import json5 from 'json5';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const API_URL =
    mode === 'development' ? 'http://127.0.0.1:5000' : 'https://recipe-manager3.herokuapp.com';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.json5'],
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.json5')) {
          const json5FilePath = path.join(process.cwd(), req.url.slice(1));
          if (fs.existsSync(json5FilePath)) {
            const fileContent = fs.readFileSync(json5FilePath, 'utf-8');
            const parsedContent = json5.parse(fileContent);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(parsedContent));
          } else {
            res.statusCode = 404;
            res.end();
          }
        } else {
          next();
        }
      });
    },
  };
});
