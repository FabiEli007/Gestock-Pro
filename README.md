# Gestock Pro

Gestock Pro est une application MERN de gestion de stock et de ventes.

## Fonctionnalites

- Authentification register/login avec JWT et refresh token
- CRUD produits avec upload photo local via Multer
- Mouvements de stock IN/OUT avec controle de quantite
- Ventes multi-produits avec deduction automatique du stock
- Dashboard avec valeur du stock, alertes de rupture, ventes du mois et top produits
- Frontend React 18, Vite, Tailwind CSS, React Router v6, Axios et Recharts

## Structure

```txt
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  uploads/
  utils/
  .env
  server.js

frontend/
  src/
    assets/
    components/
    context/
    pages/
    utils/
    App.jsx
  .env
```

## Installation

Prerequis : Node.js, npm et MongoDB local.

```bash
cd backend
npm install
npm run dev
```

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev
```

Sur Windows PowerShell, si `npm` est bloque par la politique d'execution, utilise `npm.cmd` a la place :

```bash
npm.cmd install
npm.cmd run dev
```

API : `http://localhost:5000`

Frontend : `http://localhost:5173`

## Variables d'environnement

Les fichiers `.env` de developpement sont deja fournis. Pour une vraie mise en production, remplace les secrets JWT et configure une URL MongoDB securisee.

## Endpoints API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET/POST /api/products`
- `GET/PUT/DELETE /api/products/:id`
- `GET/POST /api/stock-movements`
- `GET/POST /api/sales`
- `GET /api/dashboard`

## DevOps / GKE

Le projet contient aussi une partie Docker/Kubernetes/GCP pour deployer le backend sur GKE avec HPA.

Voir le guide complet : [DEVOPS-GKE.md](DEVOPS-GKE.md)

Dashboard web local pour la demo :

```bash
cd devops-dashboard
node server.js
```

Puis ouvrir `http://localhost:8080`.
