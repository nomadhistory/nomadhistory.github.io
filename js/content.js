// ============================================================
// CONTENT — toda a copy do site vive aqui, separada da marcação.
// Editar texto = editar este arquivo. Não é preciso tocar em HTML.
//
// Se um dia o site virar bilíngue, este objeto vira CONTENT.en e
// ganha um irmão CONTENT.pt — a estrutura não muda.
// ============================================================

const CONTENT = {
  brand: {
    name: "Historia Nomade",
    tagline: "Marketing studio for travel, hospitality and tourism",
    email: "historianomadecontact@gmail.com",
    // TODO Tiago: o WhatsApp continua vazio de propósito — número
    // inventado num site público é mensagem de cliente caindo no
    // telefone de um desconhecido. Enquanto estiver vazio, os botões
    // de WhatsApp simplesmente não aparecem.
    whatsapp: "", // só dígitos, com código do país. ex.: "5511987654321"
  },

  hero: {
    // A única referência ao nomadismo que sobrou. Curta, e cabe numa
    // linha no celular.
    eyebrow: "A travelling studio",
    title: "Every place has a story. Yours is the one thing nobody else can copy.",
    lead:
      "That's the whole strategy. We find the story and turn it into a position nobody nearby can claim, then build the brand, the site and the channels that carry it. Just the two of us, your story, and results that matter.",
    primaryCta: "Get your proposal",
    secondaryCta: "See what we fix",
  },

  team: {
    title: "Who you'd be working with",
    lead:
      "Small on purpose. You talk to the two people doing the work — nobody is handed to an account manager.",
    // `photo` é opcional: sem ela o card renderiza só o texto, sem
    // buraco nem imagem quebrada. Gerar com:
    //   python3 dev/make-photos.py <slug> <foto> [--focus 0.45]
    members: [
      {
        name: "Marina",
        photo: "assets/team/marina.webp",
        role: "Creative Strategist",
        links: [
          { label: "@marinasil_p", href: "https://www.instagram.com/marinasil_p/" },
        ],
        // Texto escrito pela própria Marina — não reescrever sem falar
        // com ela.
        bio:
          "With a background in History, Marina uncovers the story behind every business to turn its heritage into its greatest competitive advantage. In a market crowded with generic offerings, she builds strategic positioning that emotionally connects guests to your brand's true value—making your story the definitive reason they choose you.",
      },
      {
        name: "Tiago",
        photo: "assets/team/tiago.webp",
        role: "Software Engineer · Digital Marketing",
        // Abre em aba nova, sem passar o referrer.
        links: [
          { label: "@tiagohyad", href: "https://www.instagram.com/tiagohyad/" },
        ],
        bio:
          "Years in software and performance marketing. He builds the brand, the site and the channels around that story, and measures what each booking actually cost. Fast sites, clean tracking, no platform you stay paying for.",
      },
    ],
    note:
      "Agencies give you a designer who never read a line about your region and a copywriter paid by the word. Here the research and the build are done by the same two people which is why the story survives all the way into the website.",
  },

  services: {
    title: "What we fix",
    lead: "",
    items: [
      {
        id: "brand",
        image: null,
        need: "A guest scrolls past twelve places that look the same. Yours is one of them.",
        title: "Brand identity",
        deliverables: [
          "Positioning: who your place is for, and who it is not",
          "The full mark set — screen, print, signage, a painted wall",
          "Colour, type and photo direction any printer can follow",
        ],
      },
      {
        id: "website",
        image: null,
        need: "People find you, look around, and book somewhere else.",
        title: "Website and direct booking",
        deliverables: [
          "A fast, mobile-first site — live, and yours",
          "Copy that tells the story of the place instead of listing amenities",
          "SEO and Google Business Profile set up properly",
        ],
      },
      {
        id: "media",
        image: null,
        need: "Your photos look like five different businesses.",
        title: "Social media, photo and video",
        deliverables: [
          "Photo and video shot, or reworked, in your identity",
          "Every profile rebuilt to look like the same place",
          "Templates you keep using after we leave",
        ],
      },
      {
        id: "channels",
        image: null,
        need: "A booking platform is the only place you exist.",
        title: "Channels and visibility",
        deliverables: [
          "Booking, Agoda, TripAdvisor and your own site updated together",
          "Google, maps and reviews working for your name",
          "Paid traffic set up, with the real cost per booking measured",
        ],
      },
    ],
  },

  method: {
    title: "How we work",
    lead: "Same route every time, and the story comes before the design. You always know what comes next.",
    steps: [
      {
        title: "Research",
        text:
          "Two days on site, in the region and in the records. The part almost nobody does.",
      },
      {
        title: "Positioning",
        text:
          "We come back with the angle: what your place is, who it's for, why it's worth more than the one next door.",
      },
      {
        title: "Build",
        text:
          "Identity, site and content built around that angle. You review at fixed checkpoints, not at the end.",
      },
      {
        title: "Handover",
        text:
          "Everything live and transferred — files, accounts, passwords, and a short guide. No lock-in.",
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
    title: "Selected work",
    lead: "Shipped end to end — positioning, brand, build and the tools that make it useful.",
    emptyNote:
      "Our first case studies are being written up. Until they're real we'd rather show you the method than invent results — ask us and we'll walk you through work in progress.",
    items: [
      {
        published: true,
        client: "DLT Academy",
        // Projeto próprio, e o card diz isso. Passar produto da casa
        // como trabalho de cliente é o tipo de coisa que desmonta na
        // primeira pergunta.
        type: "Our own project · built by Tiago",
        location: "dlt.academy",
        href: "https://dlt.academy/",
        challenge:
          "Financial decisions get made on gut feeling, because the tools that would help are behind a signup, a paywall or a spreadsheet nobody opens.",
        approach:
          "Positioning, brand and platform: a portal plus four interactive decision tools, each answering one real question in under two minutes. Every answer is worked out in the visitor's browser.",
        // Fatos verificáveis clicando no link — não métricas de
        // desempenho, que nós ainda não temos.
        results: [
          "Portal and four decision tools live, each on its own subdomain",
          "Static build — no backend, no monthly platform cost",
          "No signup and no data collected: nothing leaves the browser",
        ],
      },
      {
        published: false,
        client: "TODO — nome do lugar",
        type: "TODO — hostel / pousada / restaurante",
        location: "TODO — cidade, país",
        href: "",
        challenge: "TODO — qual era o problema real quando chegamos",
        approach: "TODO — o que fizemos, em 2 frases",
        results: [
          "TODO — número antes → depois",
          "TODO — segundo resultado mensurável",
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // PLANOS
  // `priceWas`  — preço de referência do lançamento. Só é honesto
  //               enquanto `priceNote` disser quando ele sobe, e
  //               enquanto vocês realmente subirem. Ver o TODO abaixo.
  // `priceCustom` — texto no lugar do número (plano sob consulta).
  // ------------------------------------------------------------
  packages: {
    title: "Three ways in, and one that is up to you",
    lead:
      "Every plan starts at the story and ends in something people can book. Each one contains the one before it. Fixed scope, fixed price, in USD — confirmed once we have seen your place, and it does not move after that.",
    items: [
      {
        id: "compass",
        name: "Compass",
        forWho: "Start here if the business looks smaller than it is.",
        price: 500,
        timeline: "About 1 week",
        includes: [
          "Positioning: who you're for, and who you're not",
          "Logo and full mark set — digital, print, signage",
          "Colour, type and photo direction",
          "Brand kit any designer or printer can pick up",
        ],
      },
      {
        id: "landmark",
        name: "Landmark",
        forWho: "Start here if people already look for you and leave without booking.",
        price: 599,
        priceWas: 1000,
        // TODO Tiago: confirmar o número de projetos. Isto só pode
        // ficar no ar se o preço subir de verdade depois deles —
        // preço "de/por" que nunca sobe é propaganda enganosa.
        priceNote: "Launch price — goes to US$1,000 after our first five projects",
        timeline: "2 to 3 weeks",
        featured: true,
        includes: [
          "Everything in Compass",
          "Complete website that tells your story and takes contacts",
          "No visit limits, no monthly fee, no maintenance charge",
          "SEO and Google positioning",
          "You only pay your own domain, once a year",
        ],
      },
      {
        id: "expedition",
        name: "Expedition",
        forWho: "Start here if every channel looks like a different business.",
        price: 2000,
        timeline: "4 to 6 weeks",
        includes: [
          "Everything in Landmark",
          "New photo and video, shot in your identity",
          "Booking, Agoda and your own engine updated together",
          "Social media rebuilt and scheduled",
          "Brand strategy, positioning and a full report",
        ],
      },
      {
        id: "atlas",
        name: "Atlas",
        forWho: "Past the map. Several places, or one with a lot going on.",
        priceCustom: "Let's talk",
        timeline: "Scoped with you",
        includes: [
          "Full audit of brand, channels and funnel",
          "Deep data and social analysis",
          "Automations for enquiries, check-in and reviews",
          "Professional advertising and campaign management",
        ],
        cta: "Ask for a scope",
      },
    ],
    note: "Not sure which one fits? The form below settles it.",
  },

  proposal: {
    title: "Get your proposal",
    lead:
      "Four questions, about a minute. Everything is worked out in your browser — nothing is sent until you press a button at the end.",
  },

  contact: {
    title: "Talk to us",
    lead: "Tell us where you are and what isn't working. We answer every message ourselves.",
    // Mostrado no lugar dos botões enquanto brand.email e brand.whatsapp
    // estiverem vazios.
    pending: "Contact details are being set up — they go live with the site.",

    // Botão flutuante, presente na página inteira. Só existe se
    // brand.email estiver preenchido.
    floating: {
      label: "Email us",
      ariaLabel: "Email Historia Nomade",
      subject: "Hello from your website",
      body: "Hi Marina and Tiago,\n\nI run:\nWhere:\nWhat I need:\n\n",
    },
  },

  footer: {
    note: "Historia Nomade — brand, web, media and visibility for travel, hospitality and tourism.",
    privacy:
      "No analytics, no cookies, no tracking. Your answers never leave your device.",
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONTENT };
}
