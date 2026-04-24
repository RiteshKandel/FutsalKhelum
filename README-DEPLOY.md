# Deployment Instructions: Google Cloud

This document guides you through deploying the FutsalKhelum application using the provided `deploy-gcp.ps1` script.

## Prerequisites

1.  **Google Cloud SDK**: Install the `gcloud` CLI if you haven't already: [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
2.  **GCP Project**: Create a new project in the [Google Cloud Console](https://console.cloud.google.com/).
3.  **MongoDB Atlas**: 
    - Create a cluster on [MongoDB Atlas](https://www.mongodb.com/).
    - Choose **Google Cloud** as the provider and select the same region you plan to deploy to (e.g., `us-central1`).
    - Get your connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/futsalkhelum`).

## Step 1: Initialize gcloud

Open PowerShell and run:
```powershell
gcloud init
gcloud auth login
```

## Step 2: Set up Secrets

The deployment script expects two secrets to exist in **Cloud Secret Manager**:

1.  **MONGO_URI**: Your MongoDB Atlas connection string.
2.  **JWT_SECRET**: A random secure string for JWT signing.

Run these commands to create them:
```powershell
echo "your-mongo-uri" | gcloud secrets create MONGO_URI --data-file=-
echo "your-secure-secret" | gcloud secrets create JWT_SECRET --data-file=-
```

## Step 3: Run the Deployment Script

Run the following command from the project root:
```powershell
./deploy-gcp.ps1 -ProjectId your-project-id -Region us-central1
```

## Important Notes

- **CORS**: The backend is configured to allow requests from the `FRONTEND_URL`. The script handles the initial setup, but if you map a custom domain later, you'll need to update the `FRONTEND_URL` environment variable in the Backend Cloud Run service.
- **Google Maps**: 
  - Ensure your Maps API Key has the **Maps JavaScript API** enabled.
  - In the [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials), restrict your API key to the new Cloud Run URL to prevent unauthorized use.
