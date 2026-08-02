// ===================================================================
// CONFIGURATION FIREBASE (notifications push)
// ===================================================================
// Config du projet Firebase (console.firebase.google.com > Paramètres du projet > Général >
// Vos applications > appli Web). Ces valeurs ne sont pas secrètes — Firebase les considère
// publiques par conception, la sécurité se fait via les règles Firebase, pas en les cachant.
//
// FCM_VAPID_KEY : Paramètres du projet > Cloud Messaging > Configuration Web > Certificats Web
// Push > "Générer une paire de clés". Clé PUBLIQUE elle aussi, sans risque à exposer côté client.
//
// Ce même bloc firebaseConfig doit aussi être collé dans sw.js (les service workers ne peuvent
// pas importer les fichiers JS de la page principale) — pense à mettre à jour les deux si tu
// recrées le projet Firebase.
// ===================================================================

// TODO : à remplacer une fois le projet Firebase ASHS créé (voir config/firebase-config.js pour le mode d'emploi).
const FIREBASE_CONFIG = {
  apiKey: "TODO_A_REMPLIR",
  authDomain: "TODO_A_REMPLIR",
  projectId: "TODO_A_REMPLIR",
  storageBucket: "TODO_A_REMPLIR",
  messagingSenderId: "TODO_A_REMPLIR",
  appId: "TODO_A_REMPLIR",
};

const FCM_VAPID_KEY = "TODO_A_REMPLIR";
