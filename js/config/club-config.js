// ===================================================================
// CONFIG DU CLUB — seul fichier (avec Config.gs côté backend) à modifier
// pour adapter le frontend à une autre association : barème, effectif,
// nom d'équipe, salle, liens externes.
//
// AS HOENHEIM SPORTS (ASHS) : projet initialisé à partir de LustuZone
// (HBC Bischoffsheim). Pas encore de compte Google du club au moment de
// la création de ce fichier — plusieurs valeurs ci-dessous sont des
// PLACEHOLDERS À COMPLÉTER (repérables au commentaire "À COMPLÉTER").
// ===================================================================

// ATTENTION : ce barème doit rester identique à ACTIONS dans apps-script/Config.gs
// (source de vérité côté serveur) — à mettre à jour des deux côtés en même temps.
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

// Effectif réel SF1 (la caisse noire ne concerne que cette équipe pour l'instant, voir
// isInTeam("SF1") dans les pages Caisse noire / Repas après match / Paiement). Doit rester
// identique à PLAYERS dans apps-script/Config.gs. ATTENTION : relancer setupGrid() (ou setup())
// après avoir rempli cette liste efface le contenu actuel de la feuille Grid (sheet.clear())
// avant de la reconstruire avec ces colonnes — à ne faire qu'une fois, en connaissance de cause.
const PLAYERS = ["Alicia G.","Amélie T.","Caroline S.","Charline G.","Clara O.","Délia DS.","Enora KM.","Fantine C.","Flavie M.","Géraldine W.","Hatice K.","Hélène S.","Helin A.","Iris A.","Julianne B.","Juliette B.","Juliette L.","Laura T.","Léa S.","Lisa L.","Lisa S.","Lou-Anne C.","Lucie F.","Margaux C.","Margaux J.","Marie O.","Marion S.","Mathilde K.","Mathilde M.","Myngoc T.","Nil S.","Patricia G.","Peggy J.","Perrine S.","Philomène C.","Sarah DC.","Valentine W."];

// À COMPLÉTER : ton identifiant PayPal.me pour la caisse noire SF1 (ex: "ASHSCaisseNoire").
// Laisse vide "" tant que ce n'est pas créé : le bouton Payer reste alors simplement masqué.
const PAYPAL_ME_USERNAME = "";
// À COMPLÉTER : identifiant PayPal.me séparé pour la vie d'équipe / repas après match SF1
// (voir la page Paiement, section dédiée). Vide "" tant que non créé.
const PAYPAL_ME_USERNAME_VIE_EQUIPE = "";

const TEAMS = ["SF1", "U17M1", "U17M2"];
// Les deux équipes U17 s'entraînent ensemble (entraînements communs, effectif combiné pour la
// composition d'équipe, suivi des brûlages) — voir eventVisibleForTeam (agenda.js) et
// compositionRoster (composition.js).
const U17_TEAMS = ["U17M1", "U17M2"];
// Nombre max de matchs qu'un joueur U17M2 peut jouer avec l'U17M1 avant de ne plus pouvoir
// redescendre en M2 (règle fédérale de "brûlage") — voir bruleMatchesFor (composition.js).
const BRULAGE_MAX_MATCHES = 10;

// Adresse mail de relance visible sur Profil/Accueil pour permettre aux joueurs de la renseigner.
const EMAIL_REMINDER_UI_VISIBLE = true;

// IDs des widgets "Équipe" Score'n'co (un par équipe), au format div adaptatif —
// pas des URLs d'iframe. Laisse vide "" tant que le widget n'est pas encore créé.
const SCORENCO_WIDGET_IDS = {
  SF1: "",
  U17M1: "",
  U17M2: "",
};
// Nom affiché sur le widget Score'n'co le temps qu'il charge.
const SCORENCO_CLUB_LABEL = "AS Hoenheim Sports";

// Nom court du club utilisé partout où on affiche l'équipe (cartes de match, formulaire de
// création d'événement...).
const CLUB_TEAM_NAME = "ASHS";
// Reconnaît le nom complet du club dans un titre de match pour en extraire l'adversaire
// (ex: "AS Hoenheim Sports vs Illkirch" -> "Illkirch").
const CLUB_FULL_NAME_PATTERN = /a\.?s\.?\s*ho[eë]nheim\s*sports/gi;
const CLUB_SHORT_NAME_PATTERN = /ashs/gi;

// À COMPLÉTER : mot-clé (en minuscules) présent dans le nom de la salle du club, pour détecter
// si un match est à domicile ou à l'extérieur à partir du lieu renseigné.
const HOME_VENUE_KEYWORD = "hoenheim";
// À COMPLÉTER : nom complet de la salle, utilisé comme valeur par défaut dans les formulaires.
const DEFAULT_VENUE_NAME = "Gymnase de Hoenheim";

// Lien affiché dans le menu (icône avatar) vers le site du club.
const CLUB_WEBSITE_URL = "https://www.hoenheimsports.fr/feeds";
