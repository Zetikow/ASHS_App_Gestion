// ===================================================================
// CONFIG DU CLUB — seul fichier à modifier pour adapter le backend à
// une autre association (barème, effectif, colonnes de la feuille
// Comptes). Le reste du projet ne contient plus aucune donnée propre
// à un club en particulier.
//
// AS HOENHEIM SPORTS (ASHS) : voir js/config/club-config.js pour les
// valeurs À COMPLÉTER équivalentes côté frontend.
// ===================================================================

// Barème caisse noire SF1. Les sanctions génériques ont une variante "(match)" à double tarif
// (règle "jour de match" du club) ; celles déjà propres au contexte match (cartons, POC...) n'ont
// pas de doublon puisqu'elles ne surviennent pas à l'entraînement.
// Règles non chiffrées ici (gérées à part, pas dans ce barème) : sanction collective de +1€ par
// but au-delà de 30 encaissés lors d'un match, et récompense "-25 buts encaissés = apéro coachs".
const ACTIONS = [
  ["Retard (prévenir 30min avant)", 2],
  ["Retard (match)", 4],
  ["Remplir Sport Easy (24h avant)", 3],
  ["Remplir Sport Easy (match)", 6],
  ["Absence injustifiée", 5],
  ["Absence injustifiée (match)", 10],
  ["Oublis", 2],
  ["Oublis (match)", 4],
  ["POC (match)", 2],
  ["Tête du gardien (match et entraînement)", 3],
  ["Bêtises", 2],
  ["Bêtises (match)", 4],
  ["Embrouille entre coéquipiers (match)", 4],
  ["Carton rouge", 5],
  ["Carton bleu", 10],
  ["Sanctions match (râler...)", 3],
  ["Questions bêtes", 1],
  ["Questions bêtes (match)", 2],
  ["Râler à cause des sanctions", 2],
  ["Râler à cause des sanctions (match)", 4],
  ["Téléphone pendant entraînement", 3],
  ["Participation mensuelle", 4],
  ["Autre (à préciser)", 1],
];

// ATTENTION : ce barème est aussi dupliqué côté frontend (js/config/club-config.js) pour
// l'affichage. Les deux doivent rester synchronisés manuellement.
// À COMPLÉTER : effectif réel SF1 une fois connu (voir js/config/club-config.js).
const PLAYERS = [];

// Colonnes de la feuille "Comptes" (une ligne par personne) :
// Nom, Code, Roles, Poste, NomComplet, PhotoURL, Email, PushSubIds
const COL_NOM = 0, COL_CODE = 1, COL_ROLES = 2, COL_POSTE = 3, COL_NOMCOMPLET = 4, COL_PHOTOURL = 5, COL_EMAIL = 6, COL_PUSHSUBIDS = 7;

// À COMPLÉTER : adresse mail de gestion du club, qui reçoit une copie de chaque message envoyé
// depuis la page Support de l'appli.
const CLUB_SUPPORT_EMAIL = "";

// Nom du club utilisé comme expéditeur des mails automatiques (rappels de présence, etc.)
const CLUB_NAME = "AS Hoenheim Sports";
