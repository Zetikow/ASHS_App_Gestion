// ===================================================================
// GESTION DES MATCHS — covoiturage (extérieur), goûter d'après match
// (domicile), disponibilité table de marque (domicile + extérieur) et
// suivi des maillots (qui les prend à laver, domicile + extérieur).
// Une sous-section à la fois (window.__gestionMatchsSection), même
// sélecteur d'équipe que le reste (feuilles Covoiturage/Gouter/
// TableMarque/Maillots côté backend).
// ===================================================================

const GESTION_MATCHS_SECTIONS = [
  { id: "covoiturage", label: "Covoiturage" },
  { id: "gouter", label: "Goûter" },
  { id: "tablemarque", label: "Table de marque" },
  { id: "maillots", label: "Maillots" },
];

function covoitEntryFor(eventId, nom) {
  return covoiturage.find(r => r[0] === eventId && r[1] === nom) || null;
}
function gouterEntryFor(eventId, nom) {
  return gouter.find(r => r[0] === eventId && r[1] === nom) || null;
}
function tableMarqueEntryFor(eventId, nom) {
  return tableMarque.find(r => r[0] === eventId && r[1] === nom) || null;
}
function maillotsEntryFor(eventId, nom) {
  return maillots.find(r => r[0] === eventId && r[1] === nom) || null;
}
// Nombre de fois où cette personne a pris les maillots sur la saison.
function maillotsCountFor(nom) {
  return maillots.filter(r => r[1] === nom && r[2] === "Oui").length;
}

async function setCovoiturageApi(nom, eventId, jeConduit, places, besoinPlace) {
  const existing = covoitEntryFor(eventId, nom);
  if (existing) { existing[2] = jeConduit; existing[3] = places; existing[4] = besoinPlace; }
  else covoiturage.push([eventId, nom, jeConduit, places, besoinPlace]);
  render();
  try {
    const params = new URLSearchParams({ action: "setCovoiturage", nom, eventId, jeConduit, places, besoinPlace, authNom: session.nom, authCode: session.code });
    await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`);
  } catch (err) { isOnline = false; render(); }
}

async function setGouterApi(nom, eventId, quoi) {
  const existing = gouterEntryFor(eventId, nom);
  if (quoi) {
    if (existing) existing[2] = quoi; else gouter.push([eventId, nom, quoi]);
  } else if (existing) {
    gouter = gouter.filter(r => r !== existing);
  }
  render();
  try {
    const params = new URLSearchParams({ action: "setGouter", nom, eventId, quoi, authNom: session.nom, authCode: session.code });
    await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`);
  } catch (err) { isOnline = false; render(); }
}

async function setTableMarqueApi(nom, eventId, disponible) {
  const existing = tableMarqueEntryFor(eventId, nom);
  if (disponible) {
    if (existing) existing[2] = disponible; else tableMarque.push([eventId, nom, disponible]);
  } else if (existing) {
    tableMarque = tableMarque.filter(r => r !== existing);
  }
  render();
  try {
    const params = new URLSearchParams({ action: "setTableMarque", nom, eventId, disponible, authNom: session.nom, authCode: session.code });
    await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`);
  } catch (err) { isOnline = false; render(); }
}

async function setMaillotsApi(nom, eventId, pris) {
  const existing = maillotsEntryFor(eventId, nom);
  if (pris) {
    if (existing) existing[2] = pris; else maillots.push([eventId, nom, pris]);
  } else if (existing) {
    maillots = maillots.filter(r => r !== existing);
  }
  render();
  try {
    const params = new URLSearchParams({ action: "setMaillots", nom, eventId, pris, authNom: session.nom, authCode: session.code });
    await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`);
  } catch (err) { isOnline = false; render(); }
}

function gestionMatchsUpcoming(activeTeam, homeFilter) {
  const now = new Date();
  return evenements.filter(ev => {
    if (typeClass(ev[3]) !== "match" || eventEquipe(ev) !== activeTeam || eventDateObj(ev) < now) return false;
    if (homeFilter === "home") return isHomeMatch(ev[5]);
    if (homeFilter === "away") return !isHomeMatch(ev[5]);
    return true; // "both"
  }).sort((a, b) => eventDateObj(a) - eventDateObj(b));
}

function matchCardHeader(ev, badges) {
  const [, , , , titre, lieu] = ev;
  const d = eventDateObj(ev);
  const dateLabel = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).replace(".", "").toUpperCase();
  return `<div class="cp-match-head">
    <div><div class="cp-match-title">${escapeHtml(titre || "Match")}</div><div class="cp-match-sub">${dateLabel} · ${formatHeure(ev) || ""} · ${escapeHtml(lieu || "")}</div></div>
    <div style="display:flex; gap:6px;">${badges}</div>
  </div>`;
}

function renderCovoiturageSection(activeTeam) {
  const matches = gestionMatchsUpcoming(activeTeam, "away");
  if (matches.length === 0) return `<div class="card"><div class="muted">Aucun match à l'extérieur à venir pour cette équipe.</div></div>`;
  const identities = myCarpoolIdentitiesForTeam(activeTeam);
  let html = "";
  matches.forEach(ev => {
    const id = ev[0];
    const entries = covoiturage.filter(r => r[0] === id);
    const drivers = entries.filter(r => r[2] === "Oui");
    const needers = entries.filter(r => r[4] === "Oui");
    const totalPlaces = drivers.reduce((s, r) => s + (parseInt(r[3], 10) || 0), 0);
    html += `<div class="cp-match-card">` + matchCardHeader(ev, `
      <div class="cp-summary-badge"><div class="num" style="color:#33d17a;">${totalPlaces}</div><div class="lbl">Places</div></div>
      <div class="cp-summary-badge"><div class="num" style="color:#ffb43c;">${needers.length}</div><div class="lbl">Demandes</div></div>
    `) + `<div class="cp-cols">
        <div class="cp-col">
          <div class="cp-col-h driver">🚗 Conducteurs</div>
          ${drivers.length === 0 ? `<div class="cp-empty">Personne pour l'instant</div>` : drivers.map(r => `<div class="cp-row"><span>${escapeHtml(r[1])}</span><span class="places">${escapeHtml(r[3] || "?")} pl.</span></div>`).join("")}
        </div>
        <div class="cp-col">
          <div class="cp-col-h need">🙋 Cherchent une place</div>
          ${needers.length === 0 ? `<div class="cp-empty">Personne pour l'instant</div>` : needers.map(r => `<div class="cp-row"><span>${escapeHtml(r[1])}</span></div>`).join("")}
        </div>
      </div>`;

    if (identities.length === 0) {
      html += `<div class="muted" style="font-size:9.5px; margin-top:10px; text-align:center;">Seul ton parent peut modifier cette page pour toi.</div>`;
    } else {
      identities.forEach(idt => {
        const entry = covoitEntryFor(id, idt.nom);
        const jeConduit = entry ? entry[2] : "";
        const places = entry ? entry[3] : "3";
        const besoinPlace = entry ? entry[4] : "";
        html += `<div class="cp-edit-box">
          <div class="cp-edit-label">${idt.isChild ? `Pour ${escapeHtml(idt.nom)} <span class="cp-for-child">ton enfant</span>` : "Toi"}</div>
          <div class="cp-toggle-row">
            <button type="button" class="cp-toggle-btn ${jeConduit === "Oui" ? "active-yes" : ""}" data-cp-conduit="${escapeHtml(id)}|||${escapeHtml(idt.nom)}">Je conduis</button>
            <button type="button" class="cp-toggle-btn ${besoinPlace === "Oui" ? "active-need" : ""}" data-cp-besoin="${escapeHtml(id)}|||${escapeHtml(idt.nom)}">J'ai besoin d'une place</button>
          </div>
          ${jeConduit === "Oui" ? `<div class="cp-edit-label">Nombre de places disponibles</div>
          <select data-cp-places="${escapeHtml(id)}|||${escapeHtml(idt.nom)}">
            ${[1,2,3,4,5].map(n => `<option value="${n}" ${String(places) === String(n) ? "selected" : ""}>${n}</option>`).join("")}
          </select>` : ""}
        </div>`;
      });
    }
    html += `</div>`;
  });
  return html;
}

function renderGouterSection(activeTeam) {
  const matches = gestionMatchsUpcoming(activeTeam, "home");
  if (matches.length === 0) return `<div class="card"><div class="muted">Aucun match à domicile à venir pour cette équipe.</div></div>`;
  const identities = myCarpoolIdentitiesForTeam(activeTeam);
  let html = "";
  matches.forEach(ev => {
    const id = ev[0];
    const entries = gouter.filter(r => r[0] === id);
    html += `<div class="cp-match-card">` + matchCardHeader(ev, `
      <div class="cp-summary-badge"><div class="num" style="color:#c98cf0;">${entries.length}</div><div class="lbl">Inscrits</div></div>
    `) + `<div class="cp-col">
        <div class="cp-col-h" style="color:#c98cf0;">🍪 Apportent quelque chose</div>
        ${entries.length === 0 ? `<div class="cp-empty">Personne pour l'instant</div>` : entries.map(r => `<div class="cp-row"><span>${escapeHtml(r[1])}</span><span class="places">${escapeHtml(r[2] || "")}</span></div>`).join("")}
      </div>`;

    if (identities.length === 0) {
      html += `<div class="muted" style="font-size:9.5px; margin-top:10px; text-align:center;">Seul ton parent peut modifier cette page pour toi.</div>`;
    } else {
      identities.forEach(idt => {
        const entry = gouterEntryFor(id, idt.nom);
        const quoi = entry ? entry[2] : "";
        html += `<div class="cp-edit-box">
          <div class="cp-edit-label">${idt.isChild ? `Pour ${escapeHtml(idt.nom)} <span class="cp-for-child">ton enfant</span>` : "Toi"}</div>
          <input type="text" placeholder="ex: gâteau, boissons... (vide = pas inscrit)" value="${escapeHtml(quoi)}" data-gouter-quoi="${escapeHtml(id)}|||${escapeHtml(idt.nom)}" />
        </div>`;
      });
    }
    html += `</div>`;
  });
  return html;
}

function renderTableMarqueSection(activeTeam) {
  const matches = gestionMatchsUpcoming(activeTeam, "both");
  if (matches.length === 0) return `<div class="card"><div class="muted">Aucun match à venir pour cette équipe.</div></div>`;
  const identities = myCarpoolIdentitiesForTeam(activeTeam);
  let html = "";
  matches.forEach(ev => {
    const id = ev[0];
    const entries = tableMarque.filter(r => r[0] === id);
    html += `<div class="cp-match-card">` + matchCardHeader(ev, `
      <div class="cp-summary-badge"><div class="num" style="color:#33d17a;">${entries.length}</div><div class="lbl">Disponibles</div></div>
    `) + `<div class="cp-col">
        <div class="cp-col-h driver">📋 Disponibles pour la table</div>
        ${entries.length === 0 ? `<div class="cp-empty">Personne pour l'instant</div>` : entries.map(r => `<div class="cp-row"><span>${escapeHtml(r[1])}</span></div>`).join("")}
      </div>`;

    if (identities.length === 0) {
      html += `<div class="muted" style="font-size:9.5px; margin-top:10px; text-align:center;">Seul ton parent peut modifier cette page pour toi.</div>`;
    } else {
      identities.forEach(idt => {
        const entry = tableMarqueEntryFor(id, idt.nom);
        const dispo = entry ? entry[2] : "";
        html += `<div class="cp-edit-box">
          <div class="cp-edit-label">${idt.isChild ? `Pour ${escapeHtml(idt.nom)} <span class="cp-for-child">ton enfant</span>` : "Toi"}</div>
          <button type="button" class="cp-toggle-btn ${dispo === "Oui" ? "active-yes" : ""}" style="width:100%;" data-tm-dispo="${escapeHtml(id)}|||${escapeHtml(idt.nom)}">Je suis disponible</button>
        </div>`;
      });
    }
    html += `</div>`;
  });
  return html;
}

function renderMaillotsSection(activeTeam) {
  const matches = gestionMatchsUpcoming(activeTeam, "both");
  const identities = myCarpoolIdentitiesForTeam(activeTeam);

  const roster = activeTeam === "U17" ? compositionRoster() : rosterForEquipe(activeTeam);
  const counts = roster.map(nom => ({ nom, n: maillotsCountFor(nom) })).sort((a, b) => b.n - a.n);
  let html = `<div class="card">
    <div class="section-h" style="margin-top:0;">Compteur saison</div>
    ${counts.length === 0 ? `<div class="muted">Aucun joueur enregistré pour cette équipe.</div>` : counts.map(c => `<div class="cp-row"><span>${escapeHtml(c.nom)}</span><span class="places">${c.n} fois</span></div>`).join("")}
  </div>`;

  if (matches.length === 0) return html + `<div class="card"><div class="muted">Aucun match à venir pour cette équipe.</div></div>`;

  matches.forEach(ev => {
    const id = ev[0];
    const entries = maillots.filter(r => r[0] === id && r[2] === "Oui");
    html += `<div class="cp-match-card">` + matchCardHeader(ev, `
      <div class="cp-summary-badge"><div class="num" style="color:#E8B84B;">${entries.length}</div><div class="lbl">Pris</div></div>
    `) + `<div class="cp-col">
        <div class="cp-col-h" style="color:#E8B84B;">👕 Prennent les maillots</div>
        ${entries.length === 0 ? `<div class="cp-empty">Personne pour l'instant</div>` : entries.map(r => `<div class="cp-row"><span>${escapeHtml(r[1])}</span></div>`).join("")}
      </div>`;

    if (identities.length === 0) {
      html += `<div class="muted" style="font-size:9.5px; margin-top:10px; text-align:center;">Seul ton parent peut modifier cette page pour toi.</div>`;
    } else {
      identities.forEach(idt => {
        const entry = maillotsEntryFor(id, idt.nom);
        const pris = entry ? entry[2] : "";
        html += `<div class="cp-edit-box">
          <div class="cp-edit-label">${idt.isChild ? `Pour ${escapeHtml(idt.nom)} <span class="cp-for-child">ton enfant</span>` : "Toi"}</div>
          <button type="button" class="cp-toggle-btn ${pris === "Oui" ? "active-yes" : ""}" style="width:100%;" data-maillots-pris="${escapeHtml(id)}|||${escapeHtml(idt.nom)}">Je prends les maillots</button>
        </div>`;
      });
    }
    html += `</div>`;
  });
  return html;
}

function renderGestionMatchsPage() {
  // La SF1 n'est pas concernée par cette page (covoiturage/goûter/table de marque/maillots ne
  // s'appliquent qu'aux équipes U17) — voir cartes.js pour l'équivalent SF1 (repas/apéro).
  const teams = myCarpoolTeams().filter(t => t !== "SF1");
  if (teams.length === 0) {
    return `<div class="page-title">Gestion des matchs</div><div class="card"><div class="muted">Aucune équipe concernée pour ce compte.</div></div>`;
  }
  const activeTeam = (window.__covoitTeamView && teams.includes(window.__covoitTeamView)) ? window.__covoitTeamView : teams[0];
  const section = GESTION_MATCHS_SECTIONS.some(s => s.id === window.__gestionMatchsSection) ? window.__gestionMatchsSection : "covoiturage";

  let html = `<div class="page-title">Gestion des matchs</div><div class="page-sub">Covoiturage, goûter, table de marque et maillots — équipe ${escapeHtml(activeTeam)}</div>`;
  html += renderTeamSwitcher(teams, activeTeam, "covoit-team");
  html += `<div class="team-switch-row">${GESTION_MATCHS_SECTIONS.map(s => `<button type="button" class="team-switch-btn ${section === s.id ? 'active' : ''}" data-gestion-matchs-section="${s.id}">${s.label}</button>`).join("")}</div>`;

  if (section === "covoiturage") html += renderCovoiturageSection(activeTeam);
  else if (section === "gouter") html += renderGouterSection(activeTeam);
  else if (section === "tablemarque") html += renderTableMarqueSection(activeTeam);
  else if (section === "maillots") html += renderMaillotsSection(activeTeam);

  return html;
}

// Historique du covoiturage (matchs passés) pour une personne donnée — utilisé notamment sur
// le Profil des parents, pour voir ce qui a été renseigné pour leur enfant au fil de la saison.
function renderCovoiturageHistoryCard(nom) {
  const now = new Date();
  const entries = covoiturage.filter(r => r[1] === nom).map(r => {
    const ev = evenements.find(e => e[0] === r[0]);
    return ev ? { ev, jeConduit: r[2], besoinPlace: r[4] } : null;
  }).filter(Boolean).filter(x => eventDateObj(x.ev) < now).sort((a, b) => eventDateObj(b.ev) - eventDateObj(a.ev));

  let html = `<div class="card"><div class="section-h" style="margin-top:0;">Historique covoiturage</div>`;
  if (entries.length === 0) {
    html += `<div class="muted">Aucun historique pour le moment.</div>`;
  } else {
    entries.slice(0, 8).forEach(({ ev, jeConduit, besoinPlace }) => {
      const d = eventDateObj(ev);
      const dateLabel = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).replace(".", "").toUpperCase();
      const statut = jeConduit === "Oui" ? "🚗 A conduit" : (besoinPlace === "Oui" ? "🙋 A eu besoin d'une place" : "—");
      html += `<div class="paiement-row"><div>${dateLabel} — ${escapeHtml(ev[4] || "Match")}</div><div class="muted" style="font-size:11px;">${statut}</div></div>`;
    });
  }
  html += `</div>`;
  return html;
}

function attachGestionMatchsEvents() {
  document.querySelectorAll("[data-gestion-matchs-section]").forEach(el => {
    el.onclick = () => { vibrate(); window.__gestionMatchsSection = el.dataset.gestionMatchsSection; render(); };
  });

  document.querySelectorAll("[data-covoit-team]").forEach(el => {
    el.onclick = () => { vibrate(); window.__covoitTeamView = el.dataset.covoitTeam; render(); };
  });

  document.querySelectorAll("[data-cp-conduit]").forEach(el => {
    el.onclick = () => {
      vibrate();
      const [eventId, nom] = el.dataset.cpConduit.split("|||");
      const entry = covoitEntryFor(eventId, nom);
      const newVal = (entry && entry[2] === "Oui") ? "" : "Oui";
      const places = (entry && entry[3]) || "3";
      const besoin = newVal === "Oui" ? "" : (entry ? entry[4] : "");
      setCovoiturageApi(nom, eventId, newVal, places, besoin);
    };
  });

  document.querySelectorAll("[data-cp-besoin]").forEach(el => {
    el.onclick = () => {
      vibrate();
      const [eventId, nom] = el.dataset.cpBesoin.split("|||");
      const entry = covoitEntryFor(eventId, nom);
      const newVal = (entry && entry[4] === "Oui") ? "" : "Oui";
      const jeConduit = newVal === "Oui" ? "" : (entry ? entry[2] : "");
      const places = (entry && entry[3]) || "";
      setCovoiturageApi(nom, eventId, jeConduit, places, newVal);
    };
  });

  document.querySelectorAll("[data-cp-places]").forEach(el => {
    el.onchange = () => {
      const [eventId, nom] = el.dataset.cpPlaces.split("|||");
      const entry = covoitEntryFor(eventId, nom);
      setCovoiturageApi(nom, eventId, "Oui", el.value, entry ? entry[4] : "");
    };
  });

  document.querySelectorAll("[data-gouter-quoi]").forEach(el => {
    el.onchange = () => {
      const [eventId, nom] = el.dataset.gouterQuoi.split("|||");
      setGouterApi(nom, eventId, el.value.trim());
    };
  });

  document.querySelectorAll("[data-tm-dispo]").forEach(el => {
    el.onclick = () => {
      vibrate();
      const [eventId, nom] = el.dataset.tmDispo.split("|||");
      const entry = tableMarqueEntryFor(eventId, nom);
      const newVal = (entry && entry[2] === "Oui") ? "" : "Oui";
      setTableMarqueApi(nom, eventId, newVal);
    };
  });

  document.querySelectorAll("[data-maillots-pris]").forEach(el => {
    el.onclick = () => {
      vibrate();
      const [eventId, nom] = el.dataset.maillotsPris.split("|||");
      const entry = maillotsEntryFor(eventId, nom);
      const newVal = (entry && entry[2] === "Oui") ? "" : "Oui";
      setMaillotsApi(nom, eventId, newVal);
    };
  });
}
