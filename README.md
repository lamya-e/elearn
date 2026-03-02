# ELearn — Plateforme de cours en ligne

Stack : **React + Vite + TailwindCSS + Supabase**

## Structure du projet

```
src/
├── components/
│   ├── comment/CommentSection.jsx   # Commentaires realtime
│   ├── course/CourseCard.jsx        # Carte de cours
│   ├── layout/Layout.jsx            # Layout général
│   ├── layout/Navbar.jsx            # Barre de navigation
│   └── ui/
│       ├── ProgressBar.jsx          # Barre de progression
│       └── ProtectedRoute.jsx       # Route protégée par rôle
├── context/
│   └── AuthContext.jsx              # Auth globale (user + profile)
├── hooks/
│   ├── useComments.js               # Comments + Realtime
│   ├── useCourses.js                # Liste/détail cours
│   └── useProgress.js              # Progression + inscription
├── lib/
│   └── supabaseClient.js            # Client Supabase
└── pages/
    ├── Landing.jsx                  # Page d'accueil
    ├── Login.jsx
    ├── Register.jsx
    ├── Courses.jsx                  # Browse cours
    ├── CourseDetail.jsx             # Détail + inscription
    ├── LessonViewer.jsx             # Visionneuse vidéo/PDF
    ├── Profile.jsx
    └── teacher/
        ├── TeacherDashboard.jsx     # Dashboard prof
        └── CourseForm.jsx           # Créer/modifier cours + leçons
```

## Installation

### 1. Cloner & installer

```bash
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans **SQL Editor** et copiez-collez le contenu de `supabase_schema.sql`
3. Activez **Realtime** sur la table `comments` : Database > Replication > cochez `comments`

### 3. Variables d'environnement

```bash
cp .env.example .env
```

Remplissez `.env` avec vos clés Supabase (Settings > API) :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Lancer

```bash
npm run dev
```

## Fonctionnalités

| Fonctionnalité | Rôle |
|---|---|
| S'inscrire / Se connecter | Tous |
| Choisir son rôle (étudiant/prof) | Inscription |
| Parcourir et chercher des cours | Tous |
| S'inscrire à un cours | Étudiant |
| Visionner vidéos et PDFs | Étudiant inscrit |
| Marquer une leçon comme terminée | Étudiant |
| Barre de progression | Étudiant |
| Commenter une leçon (realtime) | Utilisateurs connectés |
| Créer / modifier / supprimer un cours | Professeur |
| Upload vidéo/PDF pour les leçons | Professeur |
| Tableau de bord | Professeur |
| Éditer son profil + avatar | Tous |
