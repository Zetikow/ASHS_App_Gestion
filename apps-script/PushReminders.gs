// ===================================================================
// RAPPELS PUSH PROGRAMMÉS — notifications déclenchées par un
// déclencheur horaire (pas par une action utilisateur), toutes envoyées en push uniquement.
// Volontairement séparé de Notifications.gs (mail) pour que l'un puisse être désactivé sans
// l'autre — même schéma d'installation de déclencheur que installReminderTriggers()/
// installWeeklyDisponibilitesTrigger() dans Notifications.gs :
// ScriptApp.newTrigger(...).timeBased()...create(), avec nettoyage préalable
// des doublons via getHandlerFunction().
// ===================================================================

// ===================== TABLE DE MARQUE (hebdomadaire) =====================
// Prévient l'équipe si personne n'est encore inscrit à la table de marque pour un match dans
// les 7 prochains jours.
function sendTableMarqueReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const evSheet = ss.getSheetByName("Evenements");
  const tmSheet = ss.getSheetByName("TableMarque");
  if (!evSheet || !tmSheet) return;

  const evData = evSheet.getDataRange().getValues();
  const tmData = tmSheet.getDataRange().getValues();

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const inscritsParEvent = {};
  for (let i = 1; i < tmData.length; i++) {
    if (tmData[i][2] === "Oui") {
      inscritsParEvent[tmData[i][0]] = (inscritsParEvent[tmData[i][0]] || 0) + 1;
    }
  }

  for (let i = 1; i < evData.length; i++) {
    const row = evData[i];
    if (!row[0] || row[3] !== "Match") continue;
    const d = new Date(String(row[1]) + "T" + (row[2] || "00:00"));
    if (d < now || d > in7Days) continue;
    if (inscritsParEvent[row[0]] > 0) continue; // déjà au moins une personne inscrite

    const equipe = row[6] || "SF1";
    const adversaire = extractOpponentFromTitre(row[4]) || row[4] || "";
    const dateAff = formatDateFr(row[1]);
    const body = `Personne n'est encore inscrit pour ${equipe} vs ${adversaire} (${dateAff}).`;
    try {
      const tokens = pushTokensForEquipe(ss, equipe, ["Joueur", "Coach"], true);
      tokens.forEach(token => sendPushNotification(token, "🗓️ Table de marque", body));
    } catch (err) {
      Logger.log("Erreur notif push table de marque pour " + row[0] + " : " + err);
    }
  }
}

// ===================== COVOITURAGE (hebdomadaire) =====================
// Prévient individuellement chaque joueur qui n'a indiqué ni "je conduis" ni "besoin d'être
// conduit" pour un match dans les 7 prochains jours.
function sendCovoiturageReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const evSheet = ss.getSheetByName("Evenements");
  const covoitSheet = ss.getSheetByName("Covoiturage");
  const comptesSheet = ss.getSheetByName("Comptes");
  if (!evSheet || !covoitSheet || !comptesSheet) return;

  const evData = evSheet.getDataRange().getValues();
  const covoitData = covoitSheet.getDataRange().getValues();
  const comptes = comptesSheet.getDataRange().getValues();

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingMatches = [];
  for (let i = 1; i < evData.length; i++) {
    const row = evData[i];
    if (!row[0] || row[3] !== "Match") continue;
    const d = new Date(String(row[1]) + "T" + (row[2] || "00:00"));
    if (d >= now && d <= in7Days) upcomingMatches.push(row);
  }
  if (upcomingMatches.length === 0) return;

  // A répondu = au moins JeConduit="Oui" ou BesoinPlace="Oui" pour cet événement.
  const responded = new Set();
  for (let i = 1; i < covoitData.length; i++) {
    if (covoitData[i][2] === "Oui" || covoitData[i][4] === "Oui") {
      responded.add(`${covoitData[i][0]}_${covoitData[i][1]}`);
    }
  }

  upcomingMatches.forEach(ev => {
    const equipe = ev[6] || "SF1";
    for (let i = 1; i < comptes.length; i++) {
      const row = comptes[i];
      if (!rowHasRole(row, "Joueur") || rowEquipesForRole(row, "Joueur").indexOf(equipe) === -1) continue;
      const nom = row[COL_NOM];
      if (responded.has(`${ev[0]}_${nom}`)) continue;
      const token = row[COL_PUSHSUBIDS];
      if (!token) continue;
      try {
        sendPushNotification(token, "🚗 Covoiturage", "Tu n'as pas encore indiqué si tu conduis ou as besoin d'être conduit.");
      } catch (err) {
        Logger.log("Erreur notif push covoiturage à " + nom + " : " + err);
      }
    }
  });
}

// ===================== MATCH DEMAIN (quotidien) =====================
function sendMatchDemainReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const evSheet = ss.getSheetByName("Evenements");
  if (!evSheet) return;

  const tz = Session.getScriptTimeZone();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = Utilities.formatDate(tomorrow, tz, "yyyy-MM-dd");

  const data = evSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] || row[3] !== "Match") continue;
    if (String(row[1]).trim() !== tomorrowStr) continue;

    const equipe = row[6] || "SF1";
    const adversaire = extractOpponentFromTitre(row[4]) || row[4] || "";
    const heure = row[2] || "";
    const lieu = row[5] || "";
    const body = `${equipe} vs ${adversaire} demain à ${heure}, ${lieu}.`;
    try {
      const tokens = pushTokensForEquipe(ss, equipe, ["Joueur", "Coach"], true);
      tokens.forEach(token => sendPushNotification(token, "🏐 Match demain", body));
    } catch (err) {
      Logger.log("Erreur notif push match demain pour " + row[0] + " : " + err);
    }
  }
}

// ===================== INSTALLATION DES DÉCLENCHEURS =====================

// À exécuter UNE FOIS depuis l'éditeur : table de marque + covoiturage, chaque vendredi 9h
// (même cadence que les rappels de présence mail, voir installReminderTriggers() dans
// Notifications.gs).
function installPushWeeklyReminderTriggers() {
  ["sendTableMarqueReminders", "sendCovoiturageReminders"].forEach(fn => {
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getHandlerFunction() === fn) ScriptApp.deleteTrigger(t);
    });
    ScriptApp.newTrigger(fn).timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(9).create();
  });
}

// À exécuter UNE FOIS depuis l'éditeur : rappel match demain, tous les jours à 9h (nécessaire
// pour capter l'échéance "à J-1" au fil de l'eau, contrairement au rappel hebdomadaire ci-dessus).
function installPushDailyReminderTriggers() {
  ["sendMatchDemainReminders"].forEach(fn => {
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getHandlerFunction() === fn) ScriptApp.deleteTrigger(t);
    });
    ScriptApp.newTrigger(fn).timeBased().everyDays(1).atHour(9).create();
  });
}
