# Projet DevOps / Cloud Computing - Gestock Pro Backend

## Titre

Deploiement et orchestration d'une application backend Node.js avec Kubernetes et auto-scaling sur GCP.

## Objectif

Ce projet deploie le backend Node.js/Express de Gestock Pro dans un cluster Kubernetes GKE afin de demontrer :

- la dockerisation d'une API REST ;
- l'orchestration avec Kubernetes ;
- l'exposition reseau via un Service LoadBalancer ;
- la haute disponibilite avec plusieurs pods ;
- l'auto-scaling horizontal avec HPA ;
- les tests de charge avec Apache Benchmark.

## Architecture

```txt
Client / Apache Benchmark
        |
        v
Service LoadBalancer GKE
        |
        v
Backend Deployment Node.js
        |
        v
MongoDB Service ClusterIP
        |
        v
MongoDB Deployment + PVC
```

## Fichiers ajoutes

```txt
backend/
  Dockerfile
  .dockerignore

k8s/
  backend-secret.yaml
  backend-deployment.yaml
  backend-service.yaml
  mongo-pvc.yaml
  mongo-deployment.yaml
  mongo-service.yaml
  hpa.yaml
```

## 1. Preparer le projet GCP

Projet GCP utilise :

```txt
Nom du projet : Grid Cluster
Numero du projet : 1011424061232
ID du projet : grid-cluster-497106
```

```bash
gcloud auth login
gcloud config set project grid-cluster-497106
gcloud services enable container.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## 2. Creer le cluster GKE

```bash
gcloud container clusters create gestock-cluster \
  --zone us-central1-a \
  --num-nodes 2 \
  --machine-type e2-medium
```

Connecter `kubectl` au cluster :

```bash
gcloud container clusters get-credentials gestock-cluster --zone us-central1-a
```

## 3. Creer le depot Artifact Registry

Depuis la racine du projet :

```bash
gcloud artifacts repositories create gestock-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Images Docker Gestock Pro"
```

## 4. Construire et publier l'image avec Cloud Build

Cette option evite d'utiliser Docker Desktop localement.

Depuis la racine du projet :

```bash
gcloud builds submit backend --tag us-central1-docker.pkg.dev/grid-cluster-497106/gestock-repo/gestock-pro-backend:latest
```

## 5. Verifier l'image Kubernetes

L'image est deja configuree dans `k8s/backend-deployment.yaml` :

```yaml
image: us-central1-docker.pkg.dev/grid-cluster-497106/gestock-repo/gestock-pro-backend:latest
```

## 6. Deployer MongoDB et le backend

Depuis la racine du projet :

```bash
kubectl apply -f k8s/backend-secret.yaml
kubectl apply -f k8s/mongo-pvc.yaml
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/hpa.yaml
```

Verifier les ressources :

```bash
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get hpa
```

## 7. Recuperer l'adresse publique

```bash
kubectl get service backend-service
```

Attends que la colonne `EXTERNAL-IP` affiche une adresse publique.

Tester l'API :

```bash
curl http://EXTERNAL-IP/
curl http://EXTERNAL-IP/health
```

## 8. Observer l'auto-scaling

Le HPA est configure avec :

- minimum : 1 pod ;
- maximum : 5 pods ;
- seuil CPU : 50 %.

Commande equivalente :

```bash
kubectl autoscale deployment backend --cpu-percent=50 --min=1 --max=5
```

Suivre le scaling :

```bash
kubectl get hpa -w
kubectl get pods -w
```

## 9. Test de charge avec Apache Benchmark

Depuis une machine ou `ab` est installe :

```bash
ab -n 3000 -c 100 http://EXTERNAL-IP/
```

Pour charger directement la route healthcheck :

```bash
ab -n 3000 -c 100 http://EXTERNAL-IP/health
```

Pour declencher plus facilement le HPA, utilise la route CPU de demonstration :

```bash
ab -n 5000 -c 100 "http://EXTERNAL-IP/stress?durationMs=500"
```

Pendant le test, observe :

```bash
kubectl get hpa
kubectl get pods
kubectl top pods
```

## 10. Dashboard web local pour la demonstration

Un dashboard local est disponible dans `devops-dashboard/`. Il affiche :

- les pods ;
- les services ;
- l'adresse publique du LoadBalancer ;
- le HPA ;
- les metriques CPU/memoire ;
- des liens vers `/`, `/health` et `/stress` ;
- un bouton pour lancer un stress test sans installer Apache Benchmark.

Lancement :

```bash
cd devops-dashboard
node server.js
```

Puis ouvrir :

```txt
http://localhost:8080
```

Le dashboard utilise `kubectl.exe`, donc il faut que `kubectl get nodes` fonctionne deja dans le terminal.

## Resultats attendus

- Le backend reste disponible via `backend-service`.
- Kubernetes maintient les pods backend en etat `Running`.
- Le HPA augmente le nombre de replicas lorsque le CPU depasse 50 %.
- Le service continue a repondre pendant la montee en charge.

## Nettoyage

Supprimer les ressources Kubernetes :

```bash
kubectl delete -f k8s/
```

Supprimer le cluster GKE :

```bash
gcloud container clusters delete gestock-cluster --zone us-central1-a
```

## Remarques importantes

- Pour un projet academique, MongoDB dans Kubernetes est acceptable pour demontrer l'orchestration.
- Pour une vraie production, il vaut mieux utiliser MongoDB Atlas ou un service database gere.
- Le HPA a besoin des CPU requests dans le Deployment, deja configurees dans `backend-deployment.yaml`.
- Sur GKE, les metriques CPU sont normalement disponibles pour HPA. Si `kubectl top pods` ne fonctionne pas, verifier que le metrics server est disponible sur le cluster.
