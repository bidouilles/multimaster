# MultiMaster - Application d'Apprentissage des Tables de Multiplication

MultiMaster est une application web interactive conçue pour aider les enfants à apprendre et pratiquer leurs tables de multiplication de manière ludique et engageante.

![MultiMaster Screenshot](https://images.unsplash.com/photo-1632571401005-458e9d244591?q=80&w=1200&auto=format&fit=crop)

## Fonctionnalités

- 🎯 **Mode Apprentissage**: Visualisation interactive des tables avec support audio
- 🎮 **Mode Entraînement**: Quiz interactifs avec différents niveaux de difficulté
- 📊 **Suivi des Progrès**: Statistiques détaillées et comparaison avec d'autres joueurs
- 🏆 **Système de Récompenses**: Débloquez des badges en progressant
- 🔄 **Synchronisation**: Sauvegarde automatique des progrès avec Firebase
- 👥 **Multi-utilisateurs**: Système d'authentification complet

## Technologies Utilisées

- React avec TypeScript
- Tailwind CSS pour le style
- Firebase (Auth & Firestore) pour le backend
- Vite comme bundler

## Prérequis

- Node.js 18+ installé
- Un compte Firebase (gratuit)

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/multimaster.git
cd multimaster
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un projet Firebase :
   - Allez sur [Firebase Console](https://console.firebase.google.com)
   - Créez un nouveau projet
   - Activez Authentication (Email/Password)
   - Créez une base de données Firestore

4. Configurez Firebase :
   - Copiez vos identifiants Firebase depuis la console
   - Créez un fichier `.env` à la racine du projet :
```env
VITE_FIREBASE_API_KEY=votre-api-key
VITE_FIREBASE_AUTH_DOMAIN=votre-auth-domain
VITE_FIREBASE_PROJECT_ID=votre-project-id
VITE_FIREBASE_STORAGE_BUCKET=votre-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre-messaging-sender-id
VITE_FIREBASE_APP_ID=votre-app-id
```

5. Configurez les règles Firestore :
   - Copiez le contenu du fichier `firebase.rules` dans vos règles Firestore

## Développement

Pour lancer le serveur de développement :
```bash
npm run dev
```

## Production

Pour construire l'application pour la production :
```bash
npm run build
```

## Déploiement

L'application est configurée pour être déployée sur Netlify. Il suffit de :
1. Connecter votre dépôt à Netlify
2. Configurer les variables d'environnement dans les paramètres du projet
3. Déployer !

## Structure du Projet

```
src/
├── components/     # Composants React réutilisables
├── context/       # Contextes React (Auth, Game)
├── lib/           # Configuration Firebase
├── pages/         # Pages principales
├── services/      # Services (statistiques, etc.)
└── types/         # Types TypeScript
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.