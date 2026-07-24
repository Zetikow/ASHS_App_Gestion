// ===================================================================
// SETUP — point d'entrée unique pour initialiser toutes les feuilles.
// À exécuter UNE FOIS depuis l'éditeur (sélectionner "setup" dans le
// menu déroulant en haut, puis "Exécuter") pour un nouveau classeur.
// Sur un classeur existant, relancer setup() ne réinitialise que Grid
// (voir setupGrid) ; les autres setupXxx() n'écrivent rien si la
// feuille contient déjà des données.
//
// Pour un club qui ne veut pas un module donné (ex. Ostéo), retirer
// simplement l'appel setupXxx() correspondant ci-dessous, en plus de
// supprimer le fichier .gs du module.
// ===================================================================

function setup() {
  setupGrid();
  setupComptes();
  setupPresences();
  setupPaiements();
  setupEvenements();
  setupPresenceEvenements();
  setupActualites();
  setupCovoiturage();
  setupSupport();
  setupCompositions();
  ensureGridAction("Non renseigné avant dimanche soir", 1); // lié à Notifications.gs (checkDisponibilitesDimanche)
}

// ===================== DONNÉES DE DÉPART SPÉCIFIQUES À CE CLUB =====================
// À exécuter UNE FOIS depuis l'éditeur pour ajouter en une fois les comptes parents/joueurs
// d'une équipe — vérifie automatiquement les noms déjà existants (Nom) pour ne jamais créer de
// doublon, même si relancée plusieurs fois par erreur.
// L'effectif réel du club n'est PAS gardé ici : les comptes déjà créés vivent uniquement dans la
// feuille "Comptes" de Google Sheets (ce repo est public — ne pas y remettre de noms complets
// réels). Pour un nouvel effectif, remplace la liste ci-dessous avant d'exécuter (nom affiché,
// rôle:équipe, nom complet) :
function addU17ParentsAndPlayers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Comptes");
  ensureComptesSchema(sheet);

  const nouveauxComptes = [
    // ["Prénom N.", "Parent:Prénom Enfant N.", "Prénom NOM"],
    // ["Prénom Enfant N.", "Joueur:U17", "Prénom NOM"],
  ];

  const data = sheet.getDataRange().getValues();
  const nomsExistants = new Set(data.slice(1).map(r => String(r[COL_NOM]).trim()));

  let ajoutes = 0, ignores = 0;
  nouveauxComptes.forEach(([nom, roles, nomComplet]) => {
    if (nomsExistants.has(nom.trim())) {
      Logger.log("Ignoré (déjà existant) : " + nom);
      ignores++;
      return;
    }
    const row = new Array(8).fill("");
    row[COL_NOM] = nom;
    row[COL_ROLES] = roles;
    row[COL_NOMCOMPLET] = nomComplet;
    sheet.appendRow(row);
    nomsExistants.add(nom.trim());
    ajoutes++;
  });

  Logger.log(ajoutes + " compte(s) ajouté(s), " + ignores + " ignoré(s) car déjà existant(s).");
}

// À exécuter UNE FOIS depuis l'éditeur pour créer le compte de Perrine S. Pour l'instant en
// simple joueuse SF1 (rôles Coach U17M1/U17M2 et Admin à réactiver plus tard une fois les tests
// terminés — voir historique). Vérifie qu'il n'existe pas déjà, pour ne jamais créer de doublon.
// Le code reste vide : elle le choisit elle-même à sa première connexion (4 chiffres, rôle non-Admin).
function addPerrineAccount() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Comptes");
  ensureComptesSchema(sheet);
  const nom = "Perrine S.";
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL_NOM]).trim() === nom) {
      Logger.log("Le compte '" + nom + "' existe déjà — rien fait.");
      return;
    }
  }
  const row = new Array(8).fill("");
  row[COL_NOM] = nom;
  row[COL_ROLES] = "Joueur:SF1";
  sheet.appendRow(row);
  Logger.log("Compte '" + nom + "' créé (Joueuse SF1). Code à définir par elle-même à la première connexion (4 chiffres).");
}

// À exécuter UNE FOIS depuis l'éditeur pour créer deux comptes génériques de test, un par équipe
// U17 (Joueur:U17M1 / Joueur:U17M2), afin d'avoir de quoi naviguer dans l'appli en conditions
// proches du réel avant que l'effectif définitif ne soit connu. Vérifie qu'ils n'existent pas déjà.
function addGenericU17TestAccounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Comptes");
  ensureComptesSchema(sheet);
  const data = sheet.getDataRange().getValues();
  const nomsExistants = new Set(data.slice(1).map(r => String(r[COL_NOM]).trim()));

  const comptes = [
    ["Joueur U17M1", "Joueur:U17M1"],
    ["Joueur U17M2", "Joueur:U17M2"],
  ];

  let ajoutes = 0, ignores = 0;
  comptes.forEach(([nom, roles]) => {
    if (nomsExistants.has(nom.trim())) {
      Logger.log("Ignoré (déjà existant) : " + nom);
      ignores++;
      return;
    }
    const row = new Array(8).fill("");
    row[COL_NOM] = nom;
    row[COL_ROLES] = roles;
    sheet.appendRow(row);
    ajoutes++;
  });

  Logger.log(ajoutes + " compte(s) générique(s) créé(s), " + ignores + " ignoré(s) car déjà existant(s). Code à définir à la première connexion (4 chiffres).");
}
