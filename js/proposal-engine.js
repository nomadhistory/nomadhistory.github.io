// ============================================================
// FIELD CHECK ENGINE — lógica pura, sem DOM. Testável em Node.
//
// O formulário público não escolhe plano nem diagnostica o negócio.
// Ele apenas organiza contexto suficiente para a Historia Nomade
// revisar até três pontos usando informação pública.
// ============================================================

const VENUES = {
  hostel: {
    label: "Hostel",
    noun: "hostel",
    note:
      "We'll look at how clearly the atmosphere, direct contact and booking path come through online.",
  },
  guesthouse: {
    label: "Guesthouse or B&B",
    noun: "guesthouse",
    note:
      "We'll look at whether the character of the place is easy to understand outside third-party listings.",
  },
  hotel: {
    label: "Boutique hotel",
    noun: "hotel",
    note:
      "We'll look at the relationship between your own presence, direct contact or booking, and the main booking platforms.",
  },
  restaurant: {
    label: "Restaurant or café",
    noun: "restaurant",
    note:
      "We'll look first at maps, reviews, photos and the clarity of the direct path to the business.",
  },
  tours: {
    label: "Tours and experiences",
    noun: "tour operator",
    note:
      "We'll look at how clearly the experience, difference and booking path are explained online.",
  },
  other: {
    label: "Something else in tourism",
    noun: "business",
    note:
      "We'll review the public presence first and say clearly if the fit with Historia Nomade is weak.",
  },
};

const SERVICES = {
  brand: {
    title: "Story and positioning",
    why: "whether travellers can quickly understand what makes the place different",
  },
  website: {
    title: "Website and direct path",
    why: "whether the main information, contact and booking route are clear",
  },
  media: {
    title: "Photos, content and consistency",
    why: "whether the online presentation feels like the same place across channels",
  },
  channels: {
    title: "Discovery and third-party channels",
    why: "how the property appears across search, maps and booking platforms",
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
      { value: "nothing", label: "Barely anything — no clear brand or site" },
      { value: "logo", label: "A logo, but not much built around it" },
      { value: "old-site", label: "A website, but it feels old or unclear" },
      { value: "site-no-bookings", label: "A decent site, but the direct path feels weak" },
    ],
  },
  {
    id: "bottleneck",
    label: "What feels weakest online right now?",
    type: "choice",
    options: [
      { value: "invisible", label: "Travellers mostly find us through third-party platforms" },
      { value: "amateur", label: "Our online presence does not feel as strong as the place" },
      { value: "website", label: "Our website or direct path feels outdated or unclear" },
      { value: "manual", label: "Contact and booking take too many manual steps" },
    ],
  },
  {
    id: "contact",
    label: "Tell us where to start.",
    type: "contact",
    fields: [
      { id: "name", label: "Your name", placeholder: "Marina Silva" },
      { id: "place", label: "Name of the place", placeholder: "Casa do Porto" },
      { id: "where", label: "City and country", placeholder: "Porto, Portugal" },
    ],
  },
];

function prioritise(answers) {
  const order = {
    invisible: ["channels", "website", "brand", "media"],
    amateur: ["brand", "media", "website", "channels"],
    website: ["website", "brand", "channels", "media"],
    manual: ["website", "channels", "brand", "media"],
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

  if (answers.have === "nothing") bump("brand");
  if (answers.have === "logo") {
    bump("website");
    demote("brand");
  }
  if (answers.have === "old-site") bump("website");
  if (answers.have === "site-no-bookings") {
    sink("brand");
    bump("channels");
  }

  if (answers.venue === "restaurant") {
    bump("media");
    sink("website");
  }

  return ranked;
}

function buildFieldCheck(answers) {
  const venue = VENUES[answers.venue] || VENUES.other;
  const focus = prioritise(answers).slice(0, 3).map((id) => ({
    id,
    title: SERVICES[id].title,
    why: SERVICES[id].why,
  }));

  const place = (answers.contact && answers.contact.place) || "";
  const headline = place ? `Field Check for ${place}` : `Field Check for your ${venue.noun}`;

  return {
    headline,
    venueNote: venue.note,
    focus,
    message: buildMessage(answers, focus, venue),
  };
}

function buildMessage(answers, focus, venue) {
  const c = answers.contact || {};
  const lines = [
    "Hi Historia Nomade,",
    "",
    "I'd like a short Field Check for my place.",
    "",
    `Place: ${c.place || "(not given)"} — ${venue.label}${c.where ? `, ${c.where}` : ""}`,
    `From: ${c.name || "(not given)"}`,
    "",
    `What we have today: ${labelFor("have", answers.have)}`,
    `What feels weakest: ${labelFor("bottleneck", answers.bottleneck)}`,
    `Suggested review areas: ${focus.map((f) => f.title).join(", ")}`,
    "",
    "Please review the public presence and send the short Field Check by email. No call required.",
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
    prioritise,
    buildFieldCheck,
  };
}
