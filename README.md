# MultiMaster - Application d'Apprentissage des Tables de Multiplication

MultiMaster est une application web interactive et ludique conçue pour aider les enfants à maîtriser leurs tables de multiplication à travers différents modes de jeu et un système de progression motivant.

![MultiMaster Screenshot](https://images.unsplash.com/photo-1632571401005-458e9d244591?q=80&w=1200&auto=format&fit=crop)

## ✨ Fonctionnalités

### 📚 Apprentissage
- Visualisation interactive des tables avec support audio
- Tableau de multiplication complet avec mise en évidence des tables sélectionnées
- Astuces et conseils personnalisés basés sur les performances
- Suggestions de tables à revoir en fonction des résultats

### 🎮 Modes de Jeu
- **Mode Classique**: Quiz de 10 questions avec système d'étoiles
- **Memory**: Trouvez les paires de multiplications correspondantes
- **Contre la Montre**: Répondez à un maximum de questions avant la fin du temps
- Différents niveaux de difficulté (Facile, Moyen, Difficile)

### 🏆 Système de Progression
- Niveaux et points d'expérience (XP)
- Système d'étoiles consécutives
- Défis quotidiens
- Classement des joueurs
- Badges et récompenses

### 🔄 Fonctionnalités Techniques
- Authentification complète (inscription/connexion)
- Sauvegarde automatique des progrès
- Mode hors-ligne
- Statistiques détaillées

## 🛠 Technologies Utilisées

- React 18 avec TypeScript
- Tailwind CSS pour le style
- Firebase (Auth & Firestore)
- Framer Motion pour les animations
- Canvas Confetti pour les célébrations
- Vite comme bundler

## 📋 Prérequis

- Node.js 18+
- Compte Firebase (gratuit)

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/multimaster.git
cd multimaster
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez Firebase :
   - Créez un fichier `.env` à la racine :
```env
VITE_FIREBASE_API_KEY=votre-api-key
VITE_FIREBASE_AUTH_DOMAIN=votre-auth-domain
VITE_FIREBASE_PROJECT_ID=votre-project-id
VITE_FIREBASE_STORAGE_BUCKET=votre-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre-messaging-sender-id
VITE_FIREBASE_APP_ID=votre-app-id
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

## 🔜 Améliorations Proposées

### 1. Nouveaux Modes de Jeu
- **Mode Battle**: Affrontez d'autres joueurs en temps réel
- **Mode Histoire**: Progression à travers différents "mondes" thématiques
- **Mode Créatif**: Créez vos propres quiz et partagez-les
- **Chasse au Trésor**: Résolvez des énigmes mathématiques pour trouver des trésors

### 2. Gamification Avancée
- Système de "power-ups" (multiplicateur de points, gel du temps, etc.)
- Quêtes hebdomadaires avec récompenses spéciales
- Personnalisation de l'avatar avec des récompenses débloquées
- Collections d'objets virtuels à collectionner

### 3. Social et Communauté
- Création de classes virtuelles pour les enseignants
- Système d'amis et de défis entre amis
- Tableaux de classement par école/classe
- Partage des réussites sur les réseaux sociaux

### 4. Apprentissage Adaptatif
- Algorithme d'apprentissage adaptatif pour personnaliser la difficulté
- Détection des points faibles et suggestions personnalisées
- Parcours d'apprentissage dynamique
- Rapports détaillés pour les parents/enseignants

### 5. Multimédia et Interaction
- Support de la réalité augmentée pour visualiser les multiplications
- Mini-jeux utilisant le microphone pour les réponses vocales
- Animations et effets visuels plus élaborés
- Mode "karaoké" des tables de multiplication

### 6. Accessibilité
- Support multilingue
- Mode daltonien
- Synthèse vocale améliorée
- Interface adaptative pour différents handicaps

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre guide de contribution pour commencer.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.