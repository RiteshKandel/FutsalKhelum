# FutsalKhelum GCP Deployment Script
# Usage: ./deploy-gcp.ps1 -ProjectId your-project-id -Region us-central1

param (
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

$RepoName = "futsal-khelum"

Write-Host "--- 1. Setting GCP Project ---" -ForegroundColor Cyan
gcloud config set project $ProjectId

Write-Host "--- 2. Enabling Required APIs ---" -ForegroundColor Cyan
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

Write-Host "--- 3. Creating Artifact Registry Repository ---" -ForegroundColor Cyan
$repoExists = gcloud artifacts repositories describe $RepoName --location=$Region --quiet 2>$null
if (-not $repoExists) {
    gcloud artifacts repositories create $RepoName --repository-format=docker --location=$Region --description="FutsalKhelum Docker images"
} else {
    Write-Host "Repository already exists."
}

Write-Host "--- 4. Building and Pushing Backend Image ---" -ForegroundColor Cyan
$BackendImage = "$Region-docker.pkg.dev/$ProjectId/$RepoName/backend:latest"
gcloud builds submit ./backend --tag $BackendImage
if (-not $?) { Write-Error "Backend build failed"; exit }

Write-Host "--- 5. Deploying Backend to Cloud Run ---" -ForegroundColor Cyan
# Note: This step assumes you have already created secrets MONGO_URI and JWT_SECRET in Secret Manager
gcloud run deploy backend --image $BackendImage `
    --platform managed --region $Region --allow-unauthenticated `
    --set-secrets="MONGO_URI=MONGO_URI:latest,JWT_SECRET=JWT_SECRET:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,SMTP_PASS=SMTP_PASS:latest" `
    --set-env-vars="JWT_EXPIRES_IN=7d,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=kandelritesh@gmail.com,FROM_EMAIL=kandelritesh@gmail.com,FROM_NAME=FutsalKhelum"
if (-not $?) { Write-Error "Backend deployment failed"; exit }

$BackendUrl = gcloud run services describe backend --platform managed --region $Region --format="value(status.url)"
Write-Host "Backend deployed at: $BackendUrl" -ForegroundColor Green

Write-Host "--- 6. Building and Pushing Frontend Image ---" -ForegroundColor Cyan
$FrontendImage = "$Region-docker.pkg.dev/$ProjectId/$RepoName/frontend:latest"
$GoogleClientId = gcloud secrets versions access latest --secret="GOOGLE_CLIENT_ID"

# Using a single string for substitutions to avoid PowerShell comma splitting issues
$substitutions = "_VITE_API_URL=$BackendUrl/api,_IMAGE_NAME=$FrontendImage,_VITE_GOOGLE_CLIENT_ID=$GoogleClientId"
gcloud builds submit ./frontend --config ./frontend/cloudbuild.yaml "--substitutions=$substitutions"
if (-not $?) { Write-Error "Frontend build failed"; exit }

Write-Host "--- 7. Deploying Frontend to Cloud Run ---" -ForegroundColor Cyan
gcloud run deploy frontend --image $FrontendImage `
    --platform managed --region $Region --allow-unauthenticated `
    --port=80
if (-not $?) { Write-Error "Frontend deployment failed"; exit }

$FrontendUrl = gcloud run services describe frontend --platform managed --region $Region --format="value(status.url)"
Write-Host "Frontend deployed at: $FrontendUrl" -ForegroundColor Green

Write-Host "`nDeployment Complete!" -ForegroundColor Green
Write-Host "Check your application at: $FrontendUrl"
