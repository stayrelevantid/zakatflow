# ZakatFlow Deployment Guide

Panduan lengkap untuk deployment ZakatFlow ke Kubernetes menggunakan k3d.

## Prerequisites

Pastikan tools berikut sudah terinstall:

- [Docker](https://docs.docker.com/get-docker/)
- [k3d](https://k3d.io/v5.6.0/#installation) - `brew install k3d`
- [kubectl](https://kubernetes.io/docs/tasks/tools/) - `brew install kubectl`
- [curl](https://curl.se/)

## Quick Start

### 1. Automated Deployment (Recommended)

```bash
./deploy.sh
```

Script ini akan:

1. Build Docker image
2. Create k3d cluster
3. Install Traefik ingress controller
4. Deploy aplikasi ke Kubernetes
5. Configure DNS (/etc/hosts)
6. Test deployment

### 2. Manual Deployment

#### Step 1: Build Docker Image

```bash
docker build -t zakatflow:latest .
```

#### Step 2: Create k3d Cluster

```bash
k3d cluster create zakatflow-cluster \
  --agents 1 \
  --servers 1 \
  --port "5001:80@loadbalancer" \
  --port "5443:443@loadbalancer"
```

#### Step 3: Install Traefik

```bash
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-rbac.yml
```

#### Step 4: Import Image to k3d

```bash
k3d image import zakatflow:latest -c zakatflow-cluster
```

#### Step 5: Configure Secrets

Buat file `.env` di root project:

```env
SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

Lalu create secret:

```bash
kubectl create secret generic zakatflow-secret \
  --from-literal=SPREADSHEET_ID="$SPREADSHEET_ID" \
  --from-literal=GOOGLE_CLIENT_EMAIL="$GOOGLE_CLIENT_EMAIL" \
  --from-literal=GOOGLE_PRIVATE_KEY="$GOOGLE_PRIVATE_KEY" \
  -n zakat-system
```

#### Step 6: Deploy Application

```bash
kubectl apply -f k8s/
```

#### Step 7: Configure DNS

Tambahkan ke `/etc/hosts`:

```
127.0.0.1 zakat.local
```

#### Step 8: Verify Deployment

```bash
# Check pods
kubectl get pods -n zakat-system

# Check services
kubectl get svc -n zakat-system

# Check ingress
kubectl get ingress -n zakat-system

# Test health endpoint
curl http://zakat.local:5001/api/health
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        k3d Cluster                          │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐   │
│  │   Traefik    │───▶│  zakatflow   │───▶│   Google    │   │
│  │   Ingress    │    │   (2 pods)   │    │   Sheets    │   │
│  │   :5001,5443│    │   :3000      │    │   API       │   │
│  └──────────────┘    └──────────────┘    └─────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │
 zakat.local:5001
     (Browser)
```

## Kubernetes Resources

### Namespace

- `zakat-system` - Namespace untuk semua resources ZakatFlow

### ConfigMap

- `zakatflow-config` - Konfigurasi non-sensitive (NODE_ENV, PORT, dll)

### Secret

- `zakatflow-secret` - Credentials Google Sheets API

### Deployment

- `zakatflow` - Aplikasi utama dengan 2 replicas
- Rolling update strategy
- Resource limits: 128Mi-256Mi memory, 100m-250m CPU

### Service

- `zakatflow-svc` - ClusterIP service

### Ingress

- `zakatflow-ingress` - Traefik ingress untuk zakat.local

### HPA (Horizontal Pod Autoscaler)

- `zakatflow-hpa` - Auto-scaling 2-5 pods berdasarkan CPU/memory usage

## Monitoring

### Check Pod Logs

```bash
kubectl logs -l app.kubernetes.io/name=zakatflow -n zakat-system --tail=100
```

### Check Pod Status

```bash
kubectl get pods -n zakat-system -w
```

### Check Events

```bash
kubectl get events -n zakat-system --sort-by='.lastTimestamp'
```

### Port Forward (for debugging)

```bash
kubectl port-forward svc/zakatflow-svc 3000:80 -n zakat-system
```

## Troubleshooting

### Pod CrashLoopBackOff

```bash
# Check logs
kubectl logs deployment/zakatflow -n zakat-system --previous

# Check events
kubectl describe pod -l app.kubernetes.io/name=zakatflow -n zakat-system
```

### Image Pull Error

```bash
# Re-import image
k3d image import zakatflow:latest -c zakatflow-cluster

# Restart deployment
kubectl rollout restart deployment/zakatflow -n zakat-system
```

### Ingress Not Working

```bash
# Check Traefik pods
kubectl get pods -n traefik

# Check Traefik logs
kubectl logs -n traefik -l app=traefik

# Check ingress
kubectl describe ingress zakatflow-ingress -n zakat-system
```

## Cleanup

```bash
# Delete cluster
k3d cluster delete zakatflow-cluster

# Or use script
./deploy.sh
# Select option 7
```

## Performance

- **Image Size**: ~150-200MB (node:20-alpine base)
- **Memory Usage**: 128-256MB per pod
- **CPU Usage**: 100-250m per pod
- **Startup Time**: ~5-10 seconds
- **Health Check**: /api/health endpoint

## Security

- Non-root user (UID 1001)
- Read-only root filesystem disabled (for Google Sheets API)
- Secrets stored in Kubernetes Secrets
- Network policies (optional)
- Security headers via Traefik

## Updates

### Update Application

```bash
# Build new image
docker build -t zakatflow:latest .

# Import to k3d
k3d image import zakatflow:latest -c zakatflow-cluster

# Rolling update
kubectl rollout restart deployment/zakatflow -n zakat-system
```

### Update Secrets

```bash
kubectl delete secret zakatflow-secret -n zakat-system
kubectl create secret generic zakatflow-secret \
  --from-literal=SPREADSHEET_ID="new_id" \
  --from-literal=GOOGLE_CLIENT_EMAIL="new_email" \
  --from-literal=GOOGLE_PRIVATE_KEY="new_key" \
  -n zakat-system

kubectl rollout restart deployment/zakatflow -n zakat-system
```

## Troubleshooting Guide

### Issue: "Gagal memuat data" di Browser

**Penyebab:** Google Private Key format salah (ada quotes)

**Solusi:**

```bash
# Cek logs
kubectl logs -n zakat-system deployment/zakatflow | grep -i error

# Jika ada error DECODER routines, fix dengan:
# 1. Edit src/lib/server/sheets.ts
# 2. Pastikan ada: privateKey = privateKey.replace(/^["']|["']$/g, '');
# 3. Rebuild & redeploy
docker build -t zakatflow:latest .
k3d image import zakatflow:latest -c zakatflow-cluster
kubectl rollout restart deployment/zakatflow -n zakat-system
```

### Issue: Ingress 404 Page Not Found

**Penyebab:** Traefik IngressClass tidak terdaftar

**Solusi:**

```bash
# Cek IngressClass
kubectl get ingressclass

# Jika kosong, buat:
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: traefik
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: traefik.io/ingress-controller
EOF

# Restart Traefik
kubectl rollout restart deployment/traefik -n traefik
```

### Issue: Port Already Allocated

**Penyebab:** Port 5001 atau 5443 sudah digunakan

**Solusi:**

```bash
# Cek port yang digunakan
lsof -i :5001

# Hapus cluster lama
k3d cluster delete zakatflow-cluster

# Deploy dengan port berbeda (edit deploy.sh)
# Ganti: --port "5001:80@loadbalancer"
# Menjadi: --port "5002:80@loadbalancer"
```

### Issue: CrashLoopBackOff

**Penyebab:** envPrefix bentrok dengan K8s env vars

**Solusi:**

```bash
# Hapus envPrefix dari svelte.config.js
# Dari:
adapter: adapter({ out: 'build', precompress: true, envPrefix: 'ZAKATFLOW_' })
# Menjadi:
adapter: adapter({ out: 'build', precompress: true })

# Rebuild & redeploy
docker build -t zakatflow:latest .
k3d image import zakatflow:latest -c zakatflow-cluster
kubectl rollout restart deployment/zakatflow -n zakat-system
```

### Issue: DNS Not Resolving

**Penyebab:** /etc/hosts salah IP

**Solusi:**

```bash
# Cek IP load balancer
docker inspect k3d-zakatflow-cluster-serverlb | grep IPv4Address
# Output: "172.27.0.5/16"

# Update /etc/hosts
sudo nano /etc/hosts
# Pastikan: 172.27.0.5 zakat.local (bukan 172.27.0.3)
```

## Support

Jika mengalami masalah, silakan:

1. Cek logs: `kubectl logs -n zakat-system -l app.kubernetes.io/name=zakatflow`
2. Cek events: `kubectl get events -n zakat-system --sort-by='.lastTimestamp'`
3. Buka issue di GitHub: https://github.com/stayrelevantid/zakatflow/issues
4. Email: support@zakatflow.id

---

## 🎉 Deployment Success!

Jika semua berjalan dengan baik, Anda akan melihat:

- ✅ Pods: `2/2 Running`
- ✅ Service: `ClusterIP` aktif
- ✅ Ingress: `zakat.local` terdaftar
- ✅ Akses: http://zakat.local:5001/ berfungsi
- ✅ Data: Terkoneksi ke Google Sheets

**Selamat menggunakan ZakatFlow!** 🕌
