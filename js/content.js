// ============================================================
// CONTENT — toda a copy do site vive aqui, separada da marcação.
// Editar texto = editar este arquivo. Não é preciso tocar em HTML.
//
// Se um dia o site virar bilíngue, este objeto vira CONTENT.en e
// ganha um irmão CONTENT.pt — a estrutura não muda.
// ============================================================

const CONTENT = {
  brand: {
    name: "História Nômade",
    tagline: "Marketing studio for hotels, hostels and tourism",
    email: "historianomadecontact@gmail.com",
    // TODO Tiago: o WhatsApp continua vazio de propósito — número
    // inventado num site público é mensagem de cliente caindo no
    // telefone de um desconhecido. Enquanto estiver vazio, os botões
    // de WhatsApp simplesmente não aparecem.
    whatsapp: "", // só dígitos, com código do país. ex.: "5511987654321"
  },

  hero: {
    // Curto de propósito: cabe numa linha no celular, e o resto da
    // explicação já está no título e no parágrafo logo abaixo.
    eyebrow: "A travelling studio",
    title: "Every place has a story. Most hotels are sitting on theirs.",
    lead:
      "We are a two-person studio that travels for a living. A historian who digs out the story your property is actually built on, and a marketer-engineer who turns it into a brand, a website and a booking machine that runs without you.",
    primaryCta: "Get a proposal in 2 minutes",
    secondaryCta: "See what we do",
    // Prova rápida logo abaixo do hero.
    points: [
      "Fixed scope and fixed price — no hourly billing",
      "Built to send guests to your direct booking, not to the OTA",
      "Everything you get is yours: files, accounts, passwords",
    ],
  },

  // Faixa correndo abaixo do hero. Puramente atmosférica.
  marquee: [
    "Hostels",
    "Guesthouses",
    "Boutique hotels",
    "Mountain lodges",
    "Beach cabins",
    "Family restaurants",
    "Tour operators",
    "Vineyards",
    "Surf camps",
    "Historic inns",
  ],

  // ------------------------------------------------------------
  // ONDE ESTAMOS — a parte nômade da história. A seção só aparece
  // quando `current` estiver preenchido; enquanto estiver vazio o
  // site simplesmente não mostra nada, como nos contatos.
  // TODO Tiago: preencher com o lugar real e as próximas regiões.
  // ------------------------------------------------------------
  journey: {
    label: "Right now we're in",
    current: "Vietnam",
    since: "Working out of Southeast Asia — the route moves with the projects.",
    nextLabel: "Where we're heading",
    // TODO Tiago: as próximas paradas, quando souberem.
    // Formato: "Região — mês". Vazio esconde a coluna inteira.
    next: [],
    note:
      "Being somewhere is not the same as knowing it. We stay long enough to eat where the staff eats, learn what the building was before it was a hotel, and find out which story the neighbours tell about it — the one that never makes it onto the website.",
  },

  team: {
    title: "Who you'd be working with",
    lead:
      "Small on purpose. You talk to the two people who do the work — nobody is handed off to an account manager.",
    // `photo` é opcional: sem ela o card renderiza só o texto, sem
    // buraco nem imagem quebrada. Gerar com:
    //   python3 dev/make-photos.py <slug> <foto> [--focus 0.45]
    members: [
      {
        name: "Marina",
        photo: "assets/team/marina.webp",
        role: "Historian · Story and positioning",
        // Texto escrito pela própria Marina — não reescrever sem falar
        // com ela.
        bio:
          "With a background in History, Marina uncovers the story behind every business to turn its heritage into its greatest competitive advantage. In a market crowded with generic offerings, she builds strategic positioning that emotionally connects guests to your brand's true value—making your story the definitive reason they choose you.",
      },
      {
        name: "Tiago",
        photo: "assets/team/tiago.webp",
        role: "Marketing and engineering · Build and automation",
        // Opcional, um por membro. Abre em aba nova, sem passar o
        // referrer. Marina: é só acrescentar o mesmo bloco no card dela.
        links: [
          { label: "@tiagohyad", href: "https://instagram.com/tiagohyad" },
        ],
        bio:
          "Years in software and performance marketing. He builds the brand, the website and the automations around that story, and sets up the paid traffic that feeds it. Fast sites, clean tracking, no monthly platform you'll be stuck paying for.",
      },
    ],
    // O argumento que separa vocês de quem faz troca-por-hospedagem.
    note:
      "Agencies give you a designer who has never read anything about your region, and a copywriter paid by the word. The research and the build here are done by the same two people, in the same room — which is why the story actually survives all the way into the website.",
  },

  services: {
    title: "What we fix",
    lead:
      "Each of these starts from a problem we keep seeing in small hospitality — not from a deliverable we happen to sell.",
    items: [
      {
        id: "brand",
        need: "Guests can't tell you apart from the place next door",
        title: "Brand identity and logo",
        blurb:
          "You compete on price because nothing else about you is distinct. We build an identity that comes out of your actual story, so the price stops being the only argument.",
        deliverables: [
          "Positioning: who you're for, and who you're not for",
          "Logo and full mark set (digital, print, signage, favicon)",
          "Colour, type and photography direction",
          "Brand kit ready to hand to any designer or printer later",
        ],
      },
      {
        id: "website",
        need: "People find you, look around, and book somewhere else",
        title: "Website and direct booking",
        blurb:
          "A fast, story-driven site that answers the questions a guest actually has, and pushes them to book with you instead of paying 15–20% to an OTA.",
        deliverables: [
          "Site built and live, mobile-first, loads in under two seconds",
          "Story-driven copy written by a historian, not filler text",
          "Booking engine connected, direct-booking incentive in place",
          "Local SEO, Google Business Profile, maps and reviews wired up",
        ],
      },
      {
        id: "automation",
        need: "Your team retypes the same forty messages every day",
        title: "Automation",
        blurb:
          "The repetitive part of running a property — the same questions, the same confirmations, the same review requests — handled automatically, in your voice.",
        deliverables: [
          "Automatic replies for the questions you answer every day",
          "Booking confirmation, check-in instructions and pre-arrival flow",
          "Post-stay review request, timed to when guests actually reply",
          "Written handover so your staff can change any of it without us",
        ],
      },
      {
        id: "traffic",
        need: "Outside of Booking.com, nobody knows you exist",
        title: "Marketing and paid traffic",
        blurb:
          "Campaigns and content that bring guests to your own channels, with tracking that shows what a booking actually cost you.",
        deliverables: [
          "Instagram and Google campaigns set up and running",
          "Creative and content calendar built from your story",
          "Conversion tracking, so you see cost per booking — not just reach",
          "One month of adjustment after launch",
        ],
      },
    ],
  },

  method: {
    title: "How we work",
    lead:
      "Same process every time. You always know what's happening and what comes next.",
    steps: [
      {
        title: "Research",
        text:
          "Two days digging into the property, the region and the history. Archives, old records, whatever the family remembers. This is the part almost nobody does.",
      },
      {
        title: "Positioning",
        text:
          "We come back with the angle: what your place is, who it's for, and what makes it worth more than the property next door.",
      },
      {
        title: "Build",
        text:
          "Identity, website and automations built around that angle. You review at fixed checkpoints, not at the end.",
      },
      {
        title: "Launch",
        text:
          "We put it live, connect the booking engine, and start the campaigns. Nothing is left half-connected.",
      },
      {
        title: "Handover",
        text:
          "Every file, account and password is transferred to you, with a short written guide. No lock-in, no monthly fee to keep your own site.",
      },
    ],
  },

  // ------------------------------------------------------------
  // CASES — a única coisa aqui que não pode ser inventada.
  // Enquanto `published` for false, o card NÃO aparece no site;
  // a seção mostra o aviso de `emptyNote` no lugar.
  // Marina: preencher com trabalho real e virar published: true.
  // ------------------------------------------------------------
  cases: {
    title: "Case studies",
    lead: "What changed, in numbers, for the places we worked with.",
    emptyNote:
      "Our first case studies are being written up now. Until they're real, we'd rather show you the method above than invent results — ask us and we'll walk you through work in progress.",
    items: [
      {
        published: false,
        client: "TODO — nome do lugar",
        type: "TODO — hostel / pousada / restaurante",
        location: "TODO — cidade, país",
        challenge: "TODO — qual era o problema real quando chegamos",
        approach: "TODO — o que fizemos, em 2 frases",
        results: [
          "TODO — número antes → depois",
          "TODO — segundo resultado mensurável",
        ],
      },
    ],
  },

  packages: {
    title: "Packages and pricing",
    lead:
      "Fixed scope, fixed price, in USD. These are the real numbers we quote — an estimate, confirmed after we see your property.",
    items: [
      {
        id: "essentials",
        name: "Essentials",
        forWho: "One thing is clearly broken and you want it fixed properly.",
        price: 850,
        priceNote: "starting at",
        timeline: "About 1 week",
        includes: [
          "One focused deliverable: logo, or a single landing page, or your Google/Instagram profiles done right",
          "Positioning summary in writing",
          "All source files handed over",
        ],
      },
      {
        id: "signature",
        name: "Signature",
        forWho: "You need to look and sound like a place people book directly.",
        price: 2400,
        priceNote: "starting at",
        timeline: "2 to 3 weeks",
        featured: true,
        includes: [
          "Everything in Essentials",
          "Full brand identity built from your story",
          "Complete website with direct booking connected",
          "Local SEO and Google Business Profile",
        ],
      },
      {
        id: "residency",
        name: "Full residency",
        forWho:
          "You want the whole operation rebuilt, with us on site while we do it.",
        price: 5200,
        priceNote: "starting at",
        timeline: "4 to 6 weeks, on site",
        includes: [
          "Everything in Signature",
          "Automations for enquiries, check-in and reviews",
          "Paid traffic set up and running, with conversion tracking",
          "Historical research written up as content you can use for years",
          "Staff handover and training",
        ],
      },
    ],
  },

  // A troca é UMA FORMA DE PAGAMENTO, não a premissa do negócio.
  trade: {
    title: "Or pay us in nights",
    lead:
      "We travel while we work. For properties with rooms to spare in low season, we take the whole fee — or part of it — in accommodation and experiences instead of money.",
    points: [
      {
        title: "Same work, same standard",
        text:
          "The scope, the checkpoints and the handover are identical to a paying project. The only thing that changes is how it's settled.",
      },
      {
        title: "The stay sets the package",
        text:
          "A few nights covers Essentials. One to two weeks covers Signature. A month or more, and we do a Full residency — living in the place we're marketing, which is exactly why that tier is the good one.",
      },
      {
        title: "Low season costs you an empty room",
        text:
          "You're trading inventory you wouldn't have sold anyway for work you'd otherwise pay four figures for. That's the entire argument.",
      },
    ],
    cta: "See what your stay would cover",
  },

  proposal: {
    title: "Get your proposal",
    // Sem número fixo: o fluxo tem 5 ou 7 passos dependendo de como a
    // pessoa quer acertar o pagamento, e o contador mostra o real.
    lead:
      "A few questions, about two minutes. Everything is worked out in your browser — nothing is sent anywhere until you press a button at the end.",
  },

  contact: {
    title: "Talk to us",
    lead:
      "Tell us where you are and what's not working. We answer every message ourselves.",
    // Mostrado no lugar dos botões enquanto brand.email e brand.whatsapp
    // estiverem vazios.
    pending: "Contact details are being set up — they go live with the site.",

    // Botão flutuante, presente na página inteira. Só existe se
    // brand.email estiver preenchido.
    floating: {
      label: "Email us",
      ariaLabel: "Email História Nômade",
      subject: "Hello from your website",
      body:
        "Hi Marina and Tiago,\n\nI run:\nWhere:\nWhat I need:\n\n",
    },
  },

  footer: {
    note: "História Nômade — brand, web, automation and traffic for hospitality.",
    privacy:
      "This site has no analytics, no cookies and no tracking. Your answers never leave your device.",
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONTENT };
}
