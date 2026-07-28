// ============================================================
// PROPOSAL ENGINE — lógica pura, sem DOM. Testável em Node.
//
// Regra que governa este arquivo: TODA resposta tem que mudar a saída.
// Se um campo for perguntado e não alterar o pacote, os serviços
// priorizados, a forma de pagamento ou o texto da mensagem, ele sai
// do formulário. Perguntar por perguntar é o que faz uma árvore de
// decisão parecer inteligente sem ser.
// ============================================================

const VENUES = {
  hostel: {
    label: "Hostel",
    noun: "hostel",
    note:
      "Hostels live or die on direct bookings and on the vibe people see before they arrive — that's where we'd put the weight.",
  },
  guesthouse: {
    label: "Guesthouse or B&B",
    noun: "guesthouse",
    note:
      "Guesthouses have the strongest stories and usually the weakest presentation of them. That gap is the whole opportunity here.",
  },
  hotel: {
    label: "Boutique hotel",
    noun: "hotel",
    note:
      "A boutique hotel is already paying OTA commission on rooms it could be selling directly. Every point we shift to direct booking pays for this work.",
  },
  restaurant: {
    label: "Restaurant or café",
    noun: "restaurant",
    note:
      "For a restaurant the fight is local: maps, reviews and photos decide it long before a website does. We'd start there.",
  },
  tours: {
    label: "Tours and experiences",
    noun: "tour operator",
    note:
      "Experiences sell on the story more than any other tourism product — which is the part of this we're unusually well set up for.",
  },
  other: {
    label: "Something else in tourism",
    noun: "business",
    note:
      "We work across small tourism businesses; tell us more and we'll say honestly whether we're the right people for it.",
  },
};

const SERVICES = {
  brand: {
    title: "Brand identity",
    why: "so guests stop comparing you on price alone",
  },
  website: {
    title: "Website and direct booking",
    why: "so the people who already find you actually book with you",
  },
  automation: {
    title: "Automation",
    why: "so the repetitive messages stop eating your day",
  },
  traffic: {
    title: "Marketing and paid traffic",
    why: "so you're not dependent on one booking platform to be seen",
  },
};

const PACKAGES = {
  essentials: {
    id: "essentials",
    name: "Essentials",
    price: 850,
    timeline: "about 1 week",
    slots: 1,
  },
  signature: {
    id: "signature",
    name: "Signature",
    price: 2400,
    timeline: "2 to 3 weeks",
    slots: 2,
  },
  residency: {
    id: "residency",
    name: "Full residency",
    price: 5200,
    timeline: "4 to 6 weeks, on site",
    slots: 4,
  },
};

const QUESTIONS = [
  {
    id: "venue",
    label: "What kind of place do you run?",
    type: "choice",
    options: Object.keys(VENUES).map((k) => ({ value: k, label: VENUES[k].label })),
  },
  {
    id: "have",
    label: "What do you have today?",
    type: "choice",
    options: [
      { value: "nothing", label: "Barely anything — no logo, no site" },
      { value: "logo", label: "A logo, but nothing built around it" },
      { value: "old-site", label: "A website, but it's old and slow" },
      { value: "site-no-bookings", label: "A decent site that brings no bookings" },
    ],
  },
  {
    id: "bottleneck",
    label: "What's the real bottleneck right now?",
    type: "choice",
    options: [
      { value: "invisible", label: "Almost nobody finds us" },
      { value: "amateur", label: "We look amateur next to the competition" },
      { value: "ota", label: "All our bookings come through OTAs and their cut hurts" },
      { value: "manual", label: "We do everything by hand and there's no time left" },
    ],
  },
  {
    id: "settlement",
    label: "How would you rather settle this?",
    type: "choice",
    options: [
      { value: "money", label: "Pay in money" },
      { value: "nights", label: "Pay in accommodation — we stay with you" },
      { value: "mix", label: "A mix of both" },
    ],
  },
  {
    id: "budget",
    label: "Roughly what budget are you working with?",
    type: "choice",
    showIf: (a) => a.settlement === "money",
    options: [
      { value: "small", label: "Under US$1,000" },
      { value: "mid", label: "US$1,000 to US$3,000" },
      { value: "large", label: "US$3,000 or more" },
    ],
  },
  {
    id: "stay",
    label: "How long could you host us?",
    type: "choice",
    showIf: (a) => a.settlement === "nights" || a.settlement === "mix",
    options: [
      { value: "few", label: "A few nights" },
      { value: "week", label: "One to two weeks" },
      { value: "month", label: "A month or more" },
    ],
  },
  {
    id: "offer",
    label: "What could you offer us?",
    type: "choice",
    showIf: (a) => a.settlement === "nights" || a.settlement === "mix",
    options: [
      { value: "room", label: "A private room" },
      { value: "apartment", label: "A studio or apartment" },
      { value: "room-meals", label: "A room plus meals" },
      { value: "room-experience", label: "A room plus an experience or tour" },
    ],
  },
  {
    id: "contact",
    label: "Where should we send the proposal?",
    type: "contact",
    fields: [
      { id: "name", label: "Your name", placeholder: "Marina Silva" },
      { id: "place", label: "Name of the place", placeholder: "Casa do Porto" },
      { id: "where", label: "City and country", placeholder: "Porto, Portugal" },
    ],
  },
];

const NIGHTS_BY_STAY = { few: 4, week: 12, month: 30 };

// O que a pessoa oferece muda o acerto de verdade, não só o texto da
// mensagem: um estúdio com cozinha e mesa sustenta projeto longo,
// refeição tira o custo que inviabiliza estadia longa, e experiência
// vira material que volta pro marketing dela.
const OFFER_NOTES = {
  room: "We cover our own travel, food and equipment — you cover the room.",
  apartment:
    "A studio with a kitchen and somewhere to work is worth more to us than a room, because we work from where we stay. That's what makes the longer scope realistic.",
  "room-meals":
    "Meals included is the part that matters most on a long stay — food is the cost that usually makes these trades fall apart.",
  "room-experience":
    "We'd document the experience while we're there, and the photos and story that come out of it end up in your own marketing.",
};

// ---- lógica ------------------------------------------------

function visibleQuestions(answers) {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

// O tier vem do que é oferecido em troca: dinheiro → orçamento,
// hospedagem → duração da estadia. Uma estadia longa vale mais que
// uma curta pelo mesmo motivo que um orçamento maior: paga mais trabalho.
function pickPackage(answers) {
  if (answers.settlement === "money") {
    if (answers.budget === "large") return PACKAGES.residency;
    if (answers.budget === "mid") return PACKAGES.signature;
    return PACKAGES.essentials;
  }
  if (answers.stay === "month") return PACKAGES.residency;
  if (answers.stay === "week") return PACKAGES.signature;
  return PACKAGES.essentials;
}

// O gargalo define a prioridade; o que já existe reordena.
// Ex.: "ninguém nos acha" + "site decente sem reservas" não é o mesmo
// problema que "ninguém nos acha" + "nem logo temos".
function prioritise(answers) {
  const order = {
    invisible: ["traffic", "website", "brand", "automation"],
    amateur: ["brand", "website", "traffic", "automation"],
    ota: ["website", "traffic", "brand", "automation"],
    manual: ["automation", "website", "brand", "traffic"],
  }[answers.bottleneck] || ["website", "brand", "traffic", "automation"];

  const ranked = order.slice();

  const bump = (key) => {
    const i = ranked.indexOf(key);
    if (i > 0) ranked.unshift(ranked.splice(i, 1)[0]);
  };
  const sink = (key) => {
    const i = ranked.indexOf(key);
    if (i > -1 && i < ranked.length - 1) ranked.push(ranked.splice(i, 1)[0]);
  };
  const demote = (key) => {
    const i = ranked.indexOf(key);
    if (i > -1 && i < ranked.length - 1) {
      ranked.splice(i + 1, 0, ranked.splice(i, 1)[0]);
    }
  };

  // Nada existe: a identidade vem primeiro, não há o que construir em cima.
  if (answers.have === "nothing") bump("brand");
  // Tem logo e mais nada: a vitrine é que falta; a marca já começou.
  if (answers.have === "logo") {
    bump("website");
    demote("brand");
  }
  // Site velho: reconstruir o site é o gargalo, a marca fica onde está.
  if (answers.have === "old-site") bump("website");
  // Site bom sem reservas: o problema não é aparência, é audiência.
  if (answers.have === "site-no-bookings") {
    sink("brand");
    bump("traffic");
  }

  // Restaurante não tem OTA nem motor de reservas: tráfego local e
  // presença em mapas resolvem mais do que reconstruir o site.
  if (answers.venue === "restaurant") {
    bump("traffic");
    sink("automation");
  }

  return ranked;
}

function buildProposal(answers) {
  const pkg = pickPackage(answers);
  const venue = VENUES[answers.venue] || VENUES.other;
  const ranked = prioritise(answers);
  const focus = ranked.slice(0, pkg.slots).map((id) => ({
    id,
    title: SERVICES[id].title,
    why: SERVICES[id].why,
  }));

  const nights = NIGHTS_BY_STAY[answers.stay] || 0;
  const priced = pkg.price.toLocaleString("en-US");
  let settlement;
  if (answers.settlement === "money") {
    settlement = {
      label: `US$${priced}`,
      detail: `Fixed price, ${pkg.timeline}. Split in two — half to start, half at handover.`,
    };
  } else if (answers.settlement === "nights") {
    settlement = {
      label: `${nights} nights with you`,
      detail: `Instead of US$${priced}. ${OFFER_NOTES[answers.offer] || OFFER_NOTES.room}`,
    };
  } else {
    const half = Math.round(pkg.price / 2 / 50) * 50;
    settlement = {
      label: `${nights} nights + US$${half.toLocaleString("en-US")}`,
      detail: `Roughly half in accommodation, half in money, against a full price of US$${priced}. ${OFFER_NOTES[answers.offer] || OFFER_NOTES.room}`,
    };
  }

  const place = (answers.contact && answers.contact.place) || "";
  const headline = place ? `${pkg.name} for ${place}` : `${pkg.name} for your ${venue.noun}`;

  return {
    package: pkg,
    headline,
    venueNote: venue.note,
    focus,
    settlement,
    nights,
    message: buildMessage(answers, pkg, focus, settlement, venue),
  };
}

function buildMessage(answers, pkg, focus, settlement, venue) {
  const c = answers.contact || {};
  const lines = [
    "Hi! I used the proposal tool on your site.",
    "",
    `Place: ${c.place || "(not given)"} — ${venue.label}${c.where ? `, ${c.where}` : ""}`,
    `From: ${c.name || "(not given)"}`,
    "",
    `It recommended: ${pkg.name} (${pkg.timeline})`,
    `Focus: ${focus.map((f) => f.title).join(", ")}`,
    `Settlement: ${settlement.label}`,
    "",
    `What we have today: ${labelFor("have", answers.have)}`,
    `Biggest bottleneck: ${labelFor("bottleneck", answers.bottleneck)}`,
  ];
  if (answers.offer) lines.push(`What I can offer: ${labelFor("offer", answers.offer)}`);
  lines.push("", "Can we talk?");
  return lines.join("\n");
}

function labelFor(questionId, value) {
  const q = QUESTIONS.find((x) => x.id === questionId);
  const opt = q && q.options && q.options.find((o) => o.value === value);
  return opt ? opt.label : value || "(not given)";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    QUESTIONS,
    VENUES,
    SERVICES,
    PACKAGES,
    visibleQuestions,
    pickPackage,
    prioritise,
    buildProposal,
  };
}
