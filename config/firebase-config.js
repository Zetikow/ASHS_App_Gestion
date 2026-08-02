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

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBPG7E0qx2UJYa11j58CFRRHb9pzeP9SCI",
  authDomain: "appgestionashs.firebaseapp.com",
  projectId: "appgestionashs",
  storageBucket: "appgestionashs.firebasestorage.app",
  messagingSenderId: "541355543848",
  appId: "1:541355543848:web:bd2193de7e0f51bcd3d41d",
};

const FCM_VAPID_KEY = "BNZ4t3UHm90vgGIQmyIzG61ZZwBUIXv_VAoJo5yzj4MSZz6z3D0cZ-LFQHZCWv-xIFYaFnYY1_xgrPDtWkTqZP8";
