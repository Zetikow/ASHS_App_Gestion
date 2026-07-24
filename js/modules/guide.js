// ===================================================================
// CONSIGNES D'UTILISATION — page d'aide statique, un texte par module
// actif pour ce club. À adapter si vous retirez/ajoutez des modules.
// ===================================================================

function guideSections() {
  const isSF1 = isInTeam("SF1") || hasRole("Admin");
  const isU17 = isInTeam("U17M1") || isInTeam("U17M2") || hasRole("Admin");
  return [
    { title: "Se connecter", items: [
      "Tape ton nom — une liste de suggestions apparaît au fur et à mesure.",
      "La première fois, choisis un code à 4 chiffres : retiens-le bien, il te sera redemandé à chaque connexion.",
      "Si tu as plusieurs rôles au club (ex : joueuse et coach), tous tes accès s'ajoutent automatiquement — rien à choisir.",
    ]},
    { title: "Accueil", items: [
      "Le prochain événement est mis en avant, avec un bouton Présent/Absent en un tap.",
      "Les résultats et prochains matchs de ton équipe défilent en carrousel (glisse ou utilise les flèches) — vert pour une victoire.",
      isSF1 ? "Un encart Caisse noire et Présence apparaît si ton rôle y donne accès." : "Un encart Présence apparaît si ton rôle y donne accès.",
    ]},
    { title: "Agenda", items: [
      "Matchs, entraînements, repas, soirées — filtrés par équipe si tu en as plusieurs.",
      "Pour les U17, les entraînements sont communs à U17M1 et U17M2 ; les matchs restent propres à chaque équipe.",
      "Coach/Admin/Salarié peuvent créer un événement avec le bouton \"+ Ajouter un événement\".",
      "Le bouton \"Exporter mon calendrier\" télécharge un fichier à ajouter à l'agenda de ton téléphone.",
    ]},
    ...(isU17 ? [{ title: "Composition d'équipe (U17)", items: [
      "Réservé au Coach et à l'Admin : bouton \"Composition\" sur une carte match U17 pour préparer l'équipe type.",
      "Glisse un joueur depuis la liste effectif vers un poste du terrain ou une place de banc.",
      "Une fois qu'un joueur est placé (terrain ou banc), tu peux en plus le glisser dans la zone libre du bas pour indiquer son placement défensif.",
      "La composition reste un brouillon invisible aux joueurs tant que tu n'as pas cliqué sur \"Rendre visible aux joueurs\".",
      "Un joueur Présent mais non retenu voit un badge \"Non sélectionné\" à la place du choix Présent/Absent, une fois la compo publiée.",
    ]}] : []),
    { title: "Actualités", items: [
      "Publications de ton équipe et publications générales du club.",
      "Coach, Admin et Salarié peuvent publier une actualité.",
    ]},
    ...(isSF1 ? [{ title: "Caisse noire (SF1)", items: [
      "Chaque joueuse SF1 voit sa carte avec le détail des actions et le total dû, ainsi que le montant déjà payé.",
      "Pour un retard (entraînement ou match), indique juste le nombre de minutes — le montant se calcule automatiquement selon le barème.",
      "Seul l'Admin peut modifier un compteur en cas d'erreur, ou consulter le tableau détaillé complet.",
    ]}] : []),
    ...(isSF1 ? [{ title: "Repas après match (SF1)", items: [
      "Fonctionne comme la caisse noire : suivi de la présence (ou absence) au repas d'après-match par joueuse.",
      "Sert de base au calcul de la participation demandée sur la page Paiement.",
    ]}] : []),
    { title: "Présence", items: [
      "Réservé au Coach et à l'Admin : historique complet et moyennes de présence par joueur.",
      isU17 ? "Pour les U17, une section supplémentaire suit les \"brûlages\" : le nombre de matchs joués par chaque U17M2 avec l'équipe U17M1, pour respecter le plafond autorisé." : null,
    ].filter(Boolean)},
    ...(isSF1 ? [{ title: "Paiement (SF1)", items: [
      "Deux sections séparées, chacune avec son propre lien PayPal : Repas après match, et Caisse noire.",
      "Chaque joueuse ne voit que son propre montant dû.",
    ]}] : []),
    { title: "Profil", items: [
      "Ta photo, tes rôles, ton ou tes postes.",
      "Renseigne ton adresse mail pour recevoir les rappels de présence — c'est le seul moyen d'être prévenu automatiquement.",
      "Si tu cumules plusieurs rôles (ex : joueuse et coach), bascule entre les vues avec les boutons en haut de la page.",
    ]},
    { title: "Agenda salarié", items: [
      "Réservé au Salarié et à l'Admin : un encart pour gérer les documents et dossiers du club (Google Drive).",
      "En dessous : suivi des événements club (sponsors, présence des foodtrucks aux matchs...).",
    ]},
    { title: "Galerie photos", items: [
      "Accessible depuis le bouton 📷 sur la carte des résultats de l'Accueil.",
      "Les photos sont ajoutées par l'Admin ou le Salarié directement sur Google Drive.",
    ]},
    ...(isU17 ? [{ title: "Covoiturage (U17)", items: [
      "Visible pour les matchs à l'extérieur uniquement, pour U17M1 et U17M2.",
      "Indique si tu conduis (avec le nombre de places) ou si tu cherches une place.",
      "Le joueur ET son parent peuvent tous les deux le renseigner.",
    ]}] : []),
    ...(isU17 ? [{ title: "Gestion des matchs (U17)", items: [
      "Inscriptions bénévoles pour la préparation du goûter et la table de marque, match par match.",
    ]}] : []),
    { title: "Une question qui n'est pas ici ?", items: [
    "Utilise \"Support / une question ?\" dans le menu (en cliquant sur tes initiales) — ton message part directement à l'équipe de gestion du club.",
    "Tu retrouves tes demandes précédentes sur cette même page, avec la réponse dès qu'elle est donnée (et un mail te prévient).",
  ]},
  ];
}

function renderGuidePage() {
  let html = `<button class="back-link" data-goto-page="home">← Retour à l'accueil</button>`;
  html += `<div class="page-title">Consignes d'utilisation</div><div class="page-sub">Tout ce qu'il faut savoir pour utiliser l'appli ASHS</div>`;
  guideSections().forEach(s => {
    html += `<div class="card">
      <div class="section-h" style="margin-top:0;">${escapeHtml(s.title)}</div>
      ${s.items.map(i => `<div style="font-size:12.5px; color:#e4e8f2; margin-bottom:7px; line-height:1.5; padding-left:14px; position:relative;"><span style="position:absolute; left:0;">•</span>${escapeHtml(i)}</div>`).join("")}
    </div>`;
  });
  return html;
}
