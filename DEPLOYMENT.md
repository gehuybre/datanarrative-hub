# GitHub Pages Deployment Setup

This repository is now configured for automatic deployment to GitHub Pages using GitHub Actions.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/gehuybre/datanarrative-hub`
2. Navigate to **Settings** > **Pages**
3. Under **Source**, select "Deploy from a branch"
4. Choose **GitHub Actions** as the source
5. Save the settings

### 2. Configure Repository Settings

Ensure your repository has the following settings:
- **Actions**: Enabled (Settings > Actions > General)
- **Workflow permissions**: Read and write permissions (Settings > Actions > General > Workflow permissions)

### 3. How It Works

The deployment workflow (`.github/workflows/deploy.yml`) will:
- Trigger automatically on every push to the `main` branch
- Install dependencies with `npm ci`
- Build the project with `npm run build`
- Deploy the built files to GitHub Pages

### 4. Access Your Deployed Site

After the first successful deployment, your site will be available at:
`https://gehuybre.github.io/datanarrative-hub/`

### 5. Manual Deployment

You can also trigger a deployment manually:
1. Go to the **Actions** tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Build Configuration

The `vite.config.ts` has been updated to:
- Set the correct base URL for GitHub Pages deployment
- Handle both development and production environments

## Troubleshooting

If deployment fails:
1. Check the **Actions** tab for error logs
2. Ensure all dependencies are correctly listed in `package.json`
3. Verify the build command works locally with `npm run build`
4. Check that the `dist` folder contains the built files

## Local Development

For local development, continue using:
```bash
npm run dev
```

The base URL configuration will automatically use `/` for local development.
