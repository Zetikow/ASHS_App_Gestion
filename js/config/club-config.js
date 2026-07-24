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

// À COMPLÉTER : effectif réel SF1 (la caisse noire ne concerne que cette équipe pour l'instant,
// voir isInTeam("SF1") dans les pages Caisse noire / Repas après match / Paiement). Doit rester
// identique à PLAYERS dans apps-script/Config.gs. Laisser vide tant que l'effectif n'est pas
// connu : les comptes se créeront normalement, juste sans colonne dédiée dans la feuille Grid
// tant que setupGrid() n'a pas été relancé avec la vraie liste.
const PLAYERS = [];

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
