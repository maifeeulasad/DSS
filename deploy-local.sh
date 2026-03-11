#!/bin/zsh

set -e

# Source environment variables from ~/.zshrc
# source ~/.zshrc

# Check if required variables are set
if [ -z "$DSS_DB_PATH" ] || [ -z "$DSS_SECRET_KEY" ] || [ -z "$K3S_SERVER_HOST" ] || [ -z "$K3S_SERVER_SSH_KEY" ] || [ -z "$K3S_SERVER_SSH_USERNAME" ]; then
    echo "Error: Required environment variables not set in ~/.zshrc"
    echo "Please ensure DSS_DB_PATH, DSS_SECRET_KEY, K3S_SERVER_HOST, K3S_SERVER_SSH_KEY, and K3S_SERVER_SSH_USERNAME are defined."
    exit 1
fi

if [ "$K3S_SERVER_SSH_USERNAME" = "root" ]; then
    PROJECT_DIR="/root/DSS"
else
    PROJECT_DIR="/home/$K3S_SERVER_SSH_USERNAME/DSS"
fi

echo "Building backend Docker image locally..."
docker build -f Dockerfile -t dss-api:latest .
# docker build --no-cache -f Dockerfile -t dss-api:latest .

echo "Building frontend Docker image locally..."
docker build -f webui/Dockerfile -t dss-ui:latest ./webui
# docker build --no-cache -f webui/Dockerfile -t dss-ui:latest ./webui

echo "Saving images to tar files..."
docker save dss-api:latest > dss-api.tar
docker save dss-ui:latest > dss-ui.tar

echo "Configuring SSH..."
mkdir -p ~/.ssh
echo "$K3S_SERVER_SSH_KEY" > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
ssh-keyscan -H $K3S_SERVER_HOST >> ~/.ssh/known_hosts 2>/dev/null || true

echo "Ensuring remote project directory exists..."
ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no $K3S_SERVER_SSH_USERNAME@$K3S_SERVER_HOST "mkdir -p $PROJECT_DIR"

echo "Transferring images to VPS..."
scp -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no dss-api.tar dss-ui.tar $K3S_SERVER_SSH_USERNAME@$K3S_SERVER_HOST:$PROJECT_DIR/

echo "Transferring k8s manifests to VPS..."
scp -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no -r k8s/ $K3S_SERVER_SSH_USERNAME@$K3S_SERVER_HOST:$PROJECT_DIR/

echo "Deploying to k3s server..."
ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no $K3S_SERVER_SSH_USERNAME@$K3S_SERVER_HOST << EOF
set -e

echo "Deploying DSS to k3s..."

# Navigate to project directory
cd $PROJECT_DIR

# Load images from tar files
echo "Loading backend image..."
docker load < dss-api.tar

echo "Loading frontend image..."
docker load < dss-ui.tar

# Load the images into containerd
echo "Loading images into containerd..."
docker save dss-api:latest | sudo ctr -n k8s.io images import -
docker save dss-ui:latest | sudo ctr -n k8s.io images import -

# Full cleanup of namespace
kubectl delete namespace dss --ignore-not-found --wait=true

# Create namespace first if it doesn't exist
kubectl apply -f k8s/namespace.yaml

# Set KUBECONFIG to point to k3s config
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# Upsert k8s Secret for API env vars
kubectl create secret generic dss-api-secret \\
  --from-literal=DSS_SECRET_KEY="$DSS_SECRET_KEY" \\
  --from-literal=DSS_DB_PATH="$DSS_DB_PATH" \\
  -n dss \\
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy using kubectl
echo "Deploying backend to k3s cluster..."
kubectl apply -f k8s/deployment-api.yaml
kubectl apply -f k8s/ingress.yaml

echo "Deploying frontend to k3s cluster..."
kubectl apply -f k8s/deployment-ui.yaml

echo "Deployment complete!"

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/dss-api -n dss --timeout=5m || true
kubectl rollout status deployment/dss-ui -n dss --timeout=5m || true

# Show running services
echo "Services status:"
kubectl get pods -n dss
kubectl get svc -n dss

# Cleanup dangling Docker images
echo "Cleaning up dangling Docker images..."
docker image prune -f --filter "until=1h" || true

# Force restart of services to ensure new images are used
kubectl delete pod -n dss -l app=dss-ui 2>/dev/null || true
kubectl delete pod -n dss -l app=dss-api 2>/dev/null || true

# Wait for fresh pods to come up
kubectl rollout status deployment/dss-api -n dss --timeout=5m
kubectl rollout status deployment/dss-ui -n dss --timeout=5m
sleep 3

echo "Verifying deployment..."

echo "=== Services Status ==="
kubectl get pods -n dss
kubectl get svc -n dss

# Verify API is responding
echo "=== API Health Check ==="
kubectl port-forward -n dss svc/dss-api-service 8000:8000 > /dev/null 2>&1 &
API_PF_PID=\$!
sleep 2

# Check API health with timeout
if curl -s --max-time 5 http://localhost:8000/docs > /tmp/docs_response.html 2>/dev/null; then
    echo "✓ API is responding"
    echo "Response preview:"
    head -10 /tmp/docs_response.html
else
    echo "✗ API health check failed"
fi

# Kill port-forward process
kill \$API_PF_PID 2>/dev/null || true
wait \$API_PF_PID 2>/dev/null || true

# Verify UI is responding
echo "=== UI Health Check ==="
kubectl port-forward -n dss svc/dss-ui-service 3010:4173 > /dev/null 2>&1 &
UI_PF_PID=\$!
sleep 2

# Check UI health with timeout
if curl -s --max-time 5 http://localhost:3010 > /tmp/ui_response.html 2>/dev/null; then
    echo "✓ UI is responding"
    echo "Response preview:"
    head -5 /tmp/ui_response.html
else
    echo "✗ UI health check failed"
fi

# Kill port-forward process
kill \$UI_PF_PID 2>/dev/null || true
wait \$UI_PF_PID 2>/dev/null || true

echo "Deployment verification complete!"

# Cleanup tar files
rm -f dss-api.tar dss-ui.tar

EOF

echo "Cleaning up local files..."
rm -f ~/.ssh/id_rsa dss-api.tar dss-ui.tar

echo "Deployment script completed!"