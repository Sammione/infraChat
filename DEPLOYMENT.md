# InfraChat AI Deployment Guide (Vercel)

This project is optimized for deployment on Vercel as a single project.

## 1. Environment Variables
You MUST add the following environment variable in the Vercel Dashboard:
- `OPENAI_API_KEY`: Your OpenAI API Key.

## 2. Vercel Configuration Settings
When importing this repository into Vercel, use these settings:

- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` (Or keep as root and set the build command below)

### IF you set Root Directory to `frontend`:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### IF you keep Root Directory as ROOT (Recommended):
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **API**: The `api/` folder at the root will be automatically detected as Serverless Functions.

## 3. Note on Python
The backend uses FastAPI. Vercel will install dependencies from `requirements.txt` at the root and serve `api/index.py` as the backend endpoint.
