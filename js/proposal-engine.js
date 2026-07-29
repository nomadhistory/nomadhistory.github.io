// ============================================================
// PROPOSAL ENGINE — lógica pura, sem DOM. Testável em Node.
//
// Regra que governa este arquivo: TODA resposta tem que mudar a saída.
// Se um campo for perguntado e não alterar o pacote, os serviços
// priorizados ou o texto da mensagem, ele sai do formulário.
// Perguntar por perguntar é o que faz uma árvore de decisão parecer
// inteligente sem ser.
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
      "Guesthouses have the strongest stories and the weakest presentation of them. That gap is the opportunity here.",
  },
  hotel: {
    label: "Boutique hotel",
    noun: "hotel",
    note:
      "You already pay OTA commission on rooms you could sell directly. Every point moved to direct booking pays for this work.",
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
      "Experiences sell on the story more than any other tourism product — the part we're unusually well set up for.",
  },
  other: {
    label: "Something else in tourism",
    noun: "business",
    note:
      "We work across small tourism businesses. Tell us more and we'll say honestly whether we're the right people.",
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
  media: {
    title: "Social media, photo and video",
    why: "so every channel looks like the same business",
  },
  channels: {
    title: "Channels and visibility",
    why: "so one booking platform stops owning your demand",
  },
};

const PACKAGES = {
  compass: {
    id: "compass",
    name: "Compass",
    price: 500,
    timeline: "about 1 week",
    slots: 1,
  },
  landmark: {
    id: "landmark",
    name: "Landmark",
    price: 599,
    priceWas: 1000,
    timeline: "2 to 3 weeks",
    slots: 2,
  },
  expedition: {
    id: "expedition",
    name: "Expedition",
    price: 2000,
    timeline: "4 to 6 weeks",
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

// ---- lógica ------------------------------------------------

// O pacote sai do quanto está faltando, cruzando o que já existe com
// o gargalo declarado. Sem pergunta de orçamento: perguntar dinheiro
// cedo espanta, e faz a pessoa se auto-rebaixar antes de ver o valor.
function pickPackage(answers) {
  const { have, bottleneck } = answers;

  // Não tem nada, ou o problema é a dependência de OTA — os dois casos
  // exigem marca, site e canais juntos; meio pacote não resolve.
  if (have === "nothing" || bottleneck === "ota") return PACKAGES.expedition;

  // Site já existe e funciona: o que falta é pontual.
  if (have === "site-no-bookings" && (bottleneck === "invisible" || bottleneck === "manual")) {
    return PACKAGES.compass;
  }

  return PACKAGES.landmark;
}

// O gargalo define a prioridade; o que já existe reordena.
// Ex.: "ninguém nos acha" + "site decente sem reservas" não é o mesmo
// problema que "ninguém nos acha" + "nem logo temos".
function prioritise(answers) {
  const order = {
    invisible: ["channels", "website", "brand", "media"],
    amateur: ["brand", "media", "website", "channels"],
    ota: ["website", "channels", "brand", "media"],
    manual: ["channels", "website", "brand", "media"],
  }[answers.bottleneck] || ["website", "brand", "channels", "media"];

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
    bump("channels");
  }

  // Restaurante não tem OTA nem motor de reservas: presença local e
  // material visual resolvem mais do que reconstruir o site.
  if (answers.venue === "restaurant") {
    bump("media");
    sink("website");
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

  const priced = "US$" + pkg.price.toLocaleString("en-US");
  const settlement = {
    label: priced,
    detail: pkg.priceWas
      ? `Launch price, down from US$${pkg.priceWas.toLocaleString("en-US")}. Fixed scope, ${pkg.timeline}, half to start and half at handover.`
      : `Fixed price, ${pkg.timeline}. Half to start, half at handover.`,
  };

  const place = (answers.contact && answers.contact.place) || "";
  const headline = place ? `${pkg.name} for ${place}` : `${pkg.name} for your ${venue.noun}`;

  return {
    package: pkg,
    headline,
    venueNote: venue.note,
    focus,
    settlement,
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
    `Price: ${settlement.label}`,
    "",
    `What we have today: ${labelFor("have", answers.have)}`,
    `Biggest bottleneck: ${labelFor("bottleneck", answers.bottleneck)}`,
    "",
    "Can we talk?",
  ];
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
    pickPackage,
    prioritise,
    buildProposal,
  };
}
