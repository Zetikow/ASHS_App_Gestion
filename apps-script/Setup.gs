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
  setupGouter();
  setupTableMarque();
  setupMaillots();
  setupCartes();
  setupFoodtrucks();
  setupFoodtrucksCatalog();
  setupRestaurants();
  setupSupport();
  setupCompositions();
  setupSelections();
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

// Ajoute ou complète des comptes à partir d'une liste [nom, "Role:Equipe,Role:Equipe..."] —
// fusionne avec les rôles déjà existants pour une personne (ne duplique jamais un rôle:équipe
// déjà présent) au lieu de simplement l'ignorer si elle existe déjà. Nécessaire ici car
// certaines personnes apparaissent dans plusieurs listes à la fois (ex: Perrine S., déjà
// Joueuse SF1, qui devient aussi Coach U17M1/U17M2) — sans danger à relancer plusieurs fois.
function upsertComptesRoster(entries) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Comptes");
  ensureComptesSchema(sheet);
  const data = sheet.getDataRange().getValues();
  const rowIndexByNom = {};
  for (let i = 1; i < data.length; i++) rowIndexByNom[String(data[i][COL_NOM]).trim()] = i;

  let crees = 0, completes = 0;
  entries.forEach(([nomRaw, rolesToAddStr]) => {
    const nom = nomRaw.trim();
    const rolesToAdd = parseRoles(rolesToAddStr);
    const existingRowIdx = rowIndexByNom[nom];
    if (existingRowIdx === undefined) {
      const row = new Array(8).fill("");
      row[COL_NOM] = nom;
      row[COL_ROLES] = stringifyRoles(rolesToAdd);
      sheet.appendRow(row);
      rowIndexByNom[nom] = data.length; // approximatif, suffisant : cette fonction ne relit pas data après
      crees++;
    } else {
      const existingRoles = parseRoles(data[existingRowIdx][COL_ROLES]);
      const seen = new Set(existingRoles.map(r => `${r.role}:${r.equipe}`));
      let changed = false;
      rolesToAdd.forEach(r => {
        const key = `${r.role}:${r.equipe}`;
        if (!seen.has(key)) { existingRoles.push(r); seen.add(key); changed = true; }
      });
      if (changed) {
        sheet.getRange(existingRowIdx + 1, COL_ROLES + 1).setValue(stringifyRoles(existingRoles));
        completes++;
      }
    }
  });

  Logger.log(`${crees} compte(s) créé(s), ${completes} compte(s) complété(s) (rôle ajouté à un compte existant).`);
}

// À exécuter UNE FOIS depuis l'éditeur pour ajouter l'effectif réel SF1 + U17M (saison 2026-2027).
// U17M1/U17M2 : effectif joueurs mis en U17M1 par défaut (les mutations entre les deux se
// décident en cours de saison, à ajuster ensuite directement dans la feuille) ; les coachs U17M
// ont accès aux deux équipes vu qu'ils gèrent l'ensemble du groupe U17M.
function addRealSF1AndU17MRoster2026() {
  upsertComptesRoster([
    // Coachs SF1
    ["Benjamin T.", "Coach:SF1"],
    ["Damba C.", "Coach:SF1"],
    ["Geneviève M.", "Coach:SF1"],
    ["Matteo S.", "Coach:SF1"],
    ["Simon B.", "Coach:SF1"],
    // Joueuses SF1
    ["Alicia G.", "Joueur:SF1"],
    ["Amélie T.", "Joueur:SF1"],
    ["Caroline S.", "Joueur:SF1"],
    ["Charline G.", "Joueur:SF1"],
    ["Clara O.", "Joueur:SF1"],
    ["Délia DS.", "Joueur:SF1"],
    ["Enora KM.", "Joueur:SF1"],
    ["Fantine C.", "Joueur:SF1"],
    ["Flavie M.", "Joueur:SF1"],
    ["Géraldine W.", "Joueur:SF1"],
    ["Hatice K.", "Joueur:SF1"],
    ["Hélène S.", "Joueur:SF1"],
    ["Helin A.", "Joueur:SF1"],
    ["Iris A.", "Joueur:SF1"],
    ["Julianne B.", "Joueur:SF1"],
    ["Juliette B.", "Joueur:SF1"],
    ["Juliette L.", "Joueur:SF1"],
    ["Laura T.", "Joueur:SF1"],
    ["Léa S.", "Joueur:SF1"],
    ["Lisa L.", "Joueur:SF1"],
    ["Lisa S.", "Joueur:SF1"],
    ["Lou-Anne C.", "Joueur:SF1"],
    ["Lucie F.", "Joueur:SF1"],
    ["Margaux C.", "Joueur:SF1"],
    ["Margaux J.", "Joueur:SF1"],
    ["Marie O.", "Joueur:SF1"],
    ["Marion S.", "Joueur:SF1"],
    ["Mathilde K.", "Joueur:SF1"],
    ["Mathilde M.", "Joueur:SF1"],
    ["Myngoc T.", "Joueur:SF1"],
    ["Nil S.", "Joueur:SF1"],
    ["Patricia G.", "Joueur:SF1"],
    ["Peggy J.", "Joueur:SF1"],
    ["Perrine S.", "Joueur:SF1"],
    ["Philomène C.", "Joueur:SF1"],
    ["Sarah DC.", "Joueur:SF1"],
    ["Valentine W.", "Joueur:SF1"],
    // Coachs U17M (accès U17M1 + U17M2)
    ["Perrine S.", "Coach:U17M1,Coach:U17M2"],
    ["Vivien G.", "Coach:U17M1,Coach:U17M2"],
    ["Emir Z.", "Coach:U17M1,Coach:U17M2"],
    // Joueurs U17M (mis en U17M1 par défaut, à ajuster selon les mutations)
    ["Corentin E.", "Joueur:U17M1"],
    ["Arthur V.", "Joueur:U17M1"],
    ["Alexian L.", "Joueur:U17M1"],
    ["Hugo WA.", "Joueur:U17M1"],
    ["Imrane J.", "Joueur:U17M1"],
    ["Paul L.", "Joueur:U17M1"],
    ["Adrien P.", "Joueur:U17M1"],
    ["Alane K.", "Joueur:U17M1"],
    ["Romain L.", "Joueur:U17M1"],
    ["Mael K.", "Joueur:U17M1"],
    ["Mathias J.", "Joueur:U17M1"],
    ["Lucas FA.", "Joueur:U17M1"],
    ["Lucas FO.", "Joueur:U17M1"],
    ["Téo P.", "Joueur:U17M1"],
    ["Quentin G.", "Joueur:U17M1"],
    ["Léon I.", "Joueur:U17M1"],
    ["Marius B.", "Joueur:U17M1"],
    ["Martin G.", "Joueur:U17M1"],
    ["Louis M.", "Joueur:U17M1"],
    ["Clément R.", "Joueur:U17M1"],
  ]);
}

// ===================== SCISSION SF1 -> SF1 + SF2 (saison 2026-2027) =====================
// À exécuter UNE FOIS depuis l'éditeur (menu déroulant > migrateSF1ToSF1AndSF2 > Exécuter),
// après avoir redéployé le code mis à jour (TEAMS inclut désormais "SF2").
// Change l'équipe de chaque paire role:équipe listée ci-dessous (ex: "Joueur:SF1" ->
// "Joueur:SF2") dans la feuille Comptes, sans toucher aux autres rôles éventuels de la même
// personne (ex: Perrine S. reste aussi Coach:U17M1,Coach:U17M2). Idempotent : si une personne a
// déjà l'équipe cible (ou n'a plus l'équipe source), elle est simplement ignorée — sans danger à
// relancer plusieurs fois par erreur.
function migrateSF1ToSF1AndSF2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Comptes");
  ensureComptesSchema(sheet);
  const data = sheet.getDataRange().getValues();
  const rowIndexByNom = {};
  for (let i = 1; i < data.length; i++) rowIndexByNom[String(data[i][COL_NOM]).trim()] = i;

  // [nom, role, équipe actuelle, nouvelle équipe]
  const moves = [
    // Coachs
    // Benjamin T. reste Coach:SF1 (anciennement déplacé vers "Prépa physique", retirée depuis
    // que ce n'est plus une équipe — voir TEAMS dans js/config/club-config.js).
    ["Damba C.", "Coach", "SF1", "SF2"],
    ["Matteo S.", "Coach", "SF1", "SF2"],
    // Geneviève M. et Simon B. restent Coach:SF1, pas de changement.
    // Joueuses -> SF2 (les autres joueuses SF1 de addRealSF1AndU17MRoster2026 restent SF1)
    ["Alicia G.", "Joueur", "SF1", "SF2"],
    ["Amélie T.", "Joueur", "SF1", "SF2"],
    ["Délia DS.", "Joueur", "SF1", "SF2"],
    ["Fantine C.", "Joueur", "SF1", "SF2"],
    ["Hatice K.", "Joueur", "SF1", "SF2"],
    ["Julianne B.", "Joueur", "SF1", "SF2"],
    ["Léa S.", "Joueur", "SF1", "SF2"],
    ["Lisa L.", "Joueur", "SF1", "SF2"],
    ["Lisa S.", "Joueur", "SF1", "SF2"],
    ["Lucie F.", "Joueur", "SF1", "SF2"],
    ["Margaux C.", "Joueur", "SF1", "SF2"],
    ["Margaux J.", "Joueur", "SF1", "SF2"],
    ["Mathilde K.", "Joueur", "SF1", "SF2"],
    ["Nil S.", "Joueur", "SF1", "SF2"],
    ["Philomène C.", "Joueur", "SF1", "SF2"],
    ["Sarah DC.", "Joueur", "SF1", "SF2"],
    ["Valentine W.", "Joueur", "SF1", "SF2"],
  ];

  let deplaces = 0, ignores = 0;
  moves.forEach(([nom, role, fromEquipe, toEquipe]) => {
    const rowIdx = rowIndexByNom[nom.trim()];
    if (rowIdx === undefined) { Logger.log("Ignoré (compte introuvable) : " + nom); ignores++; return; }
    const roles = parseRoles(data[rowIdx][COL_ROLES]);
    const pair = roles.find(r => r.role === role && r.equipe === fromEquipe);
    if (!pair) { Logger.log("Ignoré (déjà migré ou rôle absent) : " + nom + " " + role + ":" + fromEquipe); ignores++; return; }
    pair.equipe = toEquipe;
    sheet.getRange(rowIdx + 1, COL_ROLES + 1).setValue(stringifyRoles(roles));
    deplaces++;
  });

  Logger.log(`${deplaces} rôle(s) déplacé(s), ${ignores} ignoré(s) (déjà migré ou introuvable). Pense à relancer setupGrid() si besoin — la feuille Grid n'est pas affectée par cette migration (une colonne par personne, pas par équipe).`);
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
