# 🚀 FSTI : From Skills To Income (Pilot Gitega)

**FSTI** est une plateforme numérique "frugale" et inclusive conçue pour transformer le potentiel des jeunes de Gitega en revenus réels. Ce projet est développé sous l'initiative **Advaxe** dans le cadre de la **DTA Cohort 1 (Digital Transformation for Africa)**.

---

## 📋 Aperçu du Projet
Le projet s'attaque au chômage urbain à Gitega par la création d'un pont direct entre les talents locaux (artisans, techniciens, freelances) et le marché (PME, ménages, organisations).

### Chiffres Clés du Pitch
* **Bénéficiaires :** 50 jeunes sélectionnés rigoureusement.
* **Inclusion Radicale :** 20% de personnes en situation de handicap intégrées dès le jour 1.
* **Modèle Économique :** Plateforme de mise en relation sécurisée avec coaching de prix (Mbanza AI).
* **Budget Pilote :** $2,450 USD pour une durée de 6 mois.

---

## 🛠️ Stack Technique & Design
Ce portail a été conçu pour un impact visuel maximal ("Premium Tech") tout en restant léger et performant :

* **Core :** React 18 + TypeScript.
* **Design System :** Tailwind CSS avec une architecture **Full Width (Edge-to-Edge)**.
* **UI/UX :** Glassmorphism, typographie massive (`vw` based), et thématique Dark/Light contrastée.
* **Navigation :** SPA (Single Page Application) avec gestionnaire d'état fluide.

---

## 📂 Architecture de l'Application
```text
src/
├── components/
│   ├── Navbar.tsx      # Navigation fixe (Home, Talents, Pitch, AI)
│   └── Footer.tsx      # Pied de page pro avec badges partenaires
├── views/
│   ├── HomeView.tsx    # Landing page immersive & statistiques d'impact
│   ├── ServicesView.tsx# Répertoire dynamique des 50 talents
│   ├── AboutView.tsx   # Présentation de la roadmap et de la durabilité
│   └── MbanzaView.tsx  # Interface de l'assistant IA de coaching
└── App.tsx             # Dispatcher central des vues