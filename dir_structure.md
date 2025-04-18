# Expected Directory Structure

The application expects the following structure:

```
Events/
├── client/            # Front-end React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── server/            # Back-end Express application
│   ├── index.js       # Main server file
│   ├── package.json
│   └── ...
├── events.db          # SQLite database file
├── package.json       # Root package.json
└── render.yaml        # Render configuration
```

## Troubleshooting

If directories are missing, please check your repository structure and ensure all files are properly committed.

To debug the structure on Render, you can add this to your build command:
```bash
ls -la && pwd
```
