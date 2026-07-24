// ===================================================================
// CONFIG DU CLUB — seul fichier à modifier pour adapter le backend à
// une autre association (barème, effectif, colonnes de la feuille
// Comptes). Le reste du projet ne contient plus aucune donnée propre
// à un club en particulier.
//
// AS HOENHEIM SPORTS (ASHS) : voir js/config/club-config.js pour les
// valeurs À COMPLÉTER équivalentes côté frontend.
// ===================================================================

// Repris du barème HBC Bischoffsheim comme point de départ — à ajuster au club.
const ACTIONS = [
  ["participation mensuelle", 5],
  ["Retard entraînement", 1],
  ["Retard match", 1],
  ["Absence non justifié à l'entrainement", 10],
  ["Oubli de vêtement entraînement", 3],
  ["Oubli de vêtement match", 6],
  ["Absence non justifié au match", 50],
  ["Oubli de chasuble", 2],
  ["Taxer une serviette de douche", 2],
  ["Taxer du savon", 1],
  ["Taxer de la crème", 0.5],
  ["Carton Rouge direct", 7],
  ["2min pour avoir râler", 4],
  ["Carton bleu", 15],
  ["Pas de logo ASHS pour le déplacement", 5],
  ["Ballon dégueulasse (vraiment !)", 2],
  ["Oubli du ballon (match / entrainement)", 2],
  ["Taxer de l'eau", 1],
  ["Pas présent repas après match domicile", 5],
  ["Nom dans le journal", 2],
  ["Photo dans le journal", 4],
  ["Pire action du match (+ déguisement)", 1],
  ["Meilleure action du match", 2],
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
