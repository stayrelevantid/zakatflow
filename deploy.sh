#!/bin/bash

# ZakatFlow Deployment Script for k3d
# Phase 3 & 4: Docker Build and Kubernetes Deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_NAME="zakatflow-cluster"
IMAGE_NAME="zakatflow"
IMAGE_TAG="latest"
NAMESPACE="zakat-system"

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v k3d &> /dev/null; then
        print_error "k3d is not installed. Install with: brew install k3d"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
        
        # Show image size
        IMAGE_SIZE=$(docker images ${IMAGE_NAME}:${IMAGE_TAG} --format "{{.Size}}")
        print_status "Image size: ${IMAGE_SIZE}"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Create k3d cluster
create_cluster() {
    print_status "Creating k3d cluster..."
    
    # Check if cluster already exists
    if k3d cluster list | grep -q "${CLUSTER_NAME}"; then
        print_warning "Cluster '${CLUSTER_NAME}' already exists"
        read -p "Do you want to delete and recreate it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            k3d cluster delete ${CLUSTER_NAME}
        else
            print_status "Using existing cluster"
            return
        fi
    fi
    
    # Create cluster with Traefik enabled
    k3d cluster create ${CLUSTER_NAME} \
        --agents 1 \
        --servers 1 \
        --port "5001:80@loadbalancer" \
        --port "5443:443@loadbalancer" \
        --k3s-arg "--disable=traefik@server:0" \
        --k3s-arg "--tls-san=zakat.local@server:0"
    
    print_success "Cluster created successfully"
}

# Install Traefik
install_traefik() {
    print_status "Installing Traefik..."
    
    kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
    kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-rbac.yml
    
    # Create Traefik deployment
    kubectl create namespace traefik 2>/dev/null || true
    
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik
  labels:
    app: traefik
spec:
  replicas: 1
  selector:
    matchLabels:
      app: traefik
  template:
    metadata:
      labels:
        app: traefik
    spec:
      serviceAccountName: traefik-ingress-controller
      containers:
        - name: traefik
          image: traefik:v2.10
          args:
            - --api.insecure=true
            - --providers.kubernetesingress
            - --entrypoints.web.address=:80
            - --entrypoints.websecure.address=:443
            - --certificatesresolvers.default.acme.tlschallenge=true
            - --certificatesresolvers.default.acme.email=admin@zakat.local
            - --certificatesresolvers.default.acme.storage=acme.json
          ports:
            - name: web
              containerPort: 80
            - name: websecure
              containerPort: 443
            - name: admin
              containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: traefik
  namespace: traefik
spec:
  type: LoadBalancer
  selector:
    app: traefik
  ports:
    - protocol: TCP
      port: 80
      name: web
      targetPort: 80
    - protocol: TCP
      port: 443
      name: websecure
      targetPort: 443
    - protocol: TCP
      port: 8080
      name: admin
      targetPort: 8080
EOF
    
    print_success "Traefik installed"
}

# Import image to k3d
import_image() {
    print_status "Importing Docker image to k3d..."
    
    k3d image import ${IMAGE_NAME}:${IMAGE_TAG} -c ${CLUSTER_NAME}
    
    print_success "Image imported successfully"
}

# Setup secrets
setup_secrets() {
    print_status "Setting up secrets..."
    
    # Check if namespace exists
    if ! kubectl get namespace ${NAMESPACE} &> /dev/null; then
        print_error "Namespace '${NAMESPACE}' not found. Run deploy first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        print_status "Please create .env file with the following variables:"
        echo "  SPREADSHEET_ID=your_spreadsheet_id"
        echo "  GOOGLE_CLIENT_EMAIL=your_service_account_email"
        echo "  GOOGLE_PRIVATE_KEY=your_private_key"
        exit 1
    fi
    
    # Create secret directly from .env file using kubectl
    # This handles multi-line values properly
    print_status "Creating Kubernetes secret from .env file..."
    
    # Create a temporary env file without comments
    TMP_ENV=$(mktemp)
    grep -v '^#' .env | grep -v '^$' > "$TMP_ENV"
    
    # Create secret from env file
    kubectl create secret generic zakatflow-secret \
        --from-env-file="$TMP_ENV" \
        -n ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Clean up temp file
    rm -f "$TMP_ENV"
    
    print_success "Secrets configured"
}

# Deploy to Kubernetes
deploy() {
    print_status "Deploying to Kubernetes..."
    
    # Apply all manifests
    kubectl apply -f k8s/01-namespace.yaml
    kubectl apply -f k8s/02-configmap.yaml
    # Secret is handled separately
    kubectl apply -f k8s/04-deployment.yaml
    kubectl apply -f k8s/05-service.yaml
    kubectl apply -f k8s/06-ingress.yaml
    kubectl apply -f k8s/07-hpa.yaml
    
    print_success "Application deployed"
}

# Configure /etc/hosts
configure_hosts() {
    print_status "Configuring /etc/hosts..."
    
    # Get load balancer IP
    LB_IP=$(kubectl get svc traefik -n traefik -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    
    if [ -z "$LB_IP" ]; then
        LB_IP="127.0.0.1"
        print_warning "LoadBalancer IP not found, using 127.0.0.1"
    fi
    
    # Check if entry already exists
    if grep -q "zakat.local" /etc/hosts; then
        print_warning "zakat.local already exists in /etc/hosts"
    else
        echo "${LB_IP} zakat.local" | sudo tee -a /etc/hosts
        print_success "Added zakat.local to /etc/hosts"
    fi
}

# Wait for deployment
wait_for_deployment() {
    print_status "Waiting for deployment to be ready..."
    
    kubectl wait --for=condition=available --timeout=300s deployment/zakatflow -n ${NAMESPACE}
    
    print_success "Deployment is ready"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test health endpoint
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://zakat.local:5001/api/health || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        print_success "Health check passed!"
        
        # Display health info
        curl -s http://zakat.local:5001/api/health | jq .
    else
        print_error "Health check failed with status: ${HTTP_STATUS}"
        print_status "Checking pod logs..."
        kubectl logs -l app.kubernetes.io/name=zakatflow -n ${NAMESPACE} --tail=50
    fi
}

# Show status
show_status() {
    print_status "Deployment Status:"
    echo
    echo "=== Pods ==="
    kubectl get pods -n ${NAMESPACE}
    echo
    echo "=== Services ==="
    kubectl get svc -n ${NAMESPACE}
    echo
    echo "=== Ingress ==="
    kubectl get ingress -n ${NAMESPACE}
    echo
    echo "=== Deployment ==="
    kubectl get deployment zakatflow -n ${NAMESPACE}
    echo
    echo "=== Access Application ==="
    echo "URL: http://zakat.local:5001"
    echo "Traefik Dashboard: http://localhost:8080 (if port-forwarded)"
}

# Main menu
show_menu() {
    echo
    echo "========================================"
    echo "   ZakatFlow Deployment Script"
    echo "========================================"
    echo
    echo "1) Full Deployment (Build + Deploy)"
    echo "2) Build Docker Image Only"
    echo "3) Create k3d Cluster Only"
    echo "4) Deploy to Existing Cluster"
    echo "5) Test Deployment"
    echo "6) Show Status"
    echo "7) Delete Cluster"
    echo "8) Exit"
    echo
}

# Main execution
main() {
    check_prerequisites
    
    while true; do
        show_menu
        read -p "Select option: " choice
        
        case $choice in
            1)
                build_image
                create_cluster
                install_traefik
                import_image
                deploy
                setup_secrets
                configure_hosts
                wait_for_deployment
                test_deployment
                show_status
                ;;
            2)
                build_image
                ;;
            3)
                create_cluster
                install_traefik
                ;;
            4)
                import_image
                deploy
                setup_secrets
                configure_hosts
                wait_for_deployment
                ;;
            5)
                test_deployment
                ;;
            6)
                show_status
                ;;
            7)
                print_warning "This will delete the entire cluster!"
                read -p "Are you sure? (y/n) " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    k3d cluster delete ${CLUSTER_NAME}
                    print_success "Cluster deleted"
                fi
                ;;
            8)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option"
                ;;
        esac
    done
}

# Run main function
main
