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
    email: "hello@historianomade.com",
    // TODO Tiago: o WhatsApp continua vazio de propósito — número
    // inventado num site público é mensagem de cliente caindo no
    // telefone de um desconhecido. Enquanto estiver vazio, os botões
    // de WhatsApp simplesmente não aparecem.
    whatsapp: "", // só dígitos, com código do país. ex.: "5511987654321"
  },

  hero: {
    eyebrow: "A travelling studio",
    title: "Every place has a story. Yours is the one thing nobody else can copy.",
    lead:
      "We find the story, turn it into a position nobody nearby can claim, then build the digital presence around the real bottleneck. Most projects start with the website when that is the clearest gap; brand, content, channels, growth and systems come in when the problem calls for them.",
    primaryCta: "Get a Field Check",
    secondaryCta: "See what we build",
  },

  team: {
    title: "Who you'd be working with",
    lead:
      "Small on purpose. You talk to the two people doing the work — nobody is handed to an account manager.",
    members: [
      {
        name: "Marina",
        photo: "assets/team/marina.webp",
        role: "Creative Strategist",
        links: [
          { label: "@marinasil_p", href: "https://www.instagram.com/marinasil_p/" },
        ],
        bio:
          "With a background in History, Marina uncovers the story behind every business to turn its heritage into its greatest competitive advantage. In a market crowded with generic offerings, she builds strategic positioning that emotionally connects guests to your brand's true value—making your story the definitive reason they choose you.",
      },
      {
        name: "Tiago",
        photo: "assets/team/tiago.webp",
        role: "Software Engineer · Digital Marketing",
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
    title: "What we can build for you",
    lead:
      "Website first when the website is the bottleneck. Everything else is added because the problem needs it — not because a package says it should be there.",
    items: [
      {
        id: "website",
        image: null,
        title: "Websites & direct presence",
        deliverables: [
          "New websites and rebuilds, designed mobile-first",
          "Clear page structure, core copy and a direct contact or booking path",
          "Basic on-page SEO, domain connection, deployment and handover",
          "Simple integrations with the tools you already use",
        ],
      },
      {
        id: "brand",
        image: null,
        title: "Brand & positioning",
        deliverables: [
          "Positioning and the message people should remember",
          "Identity systems, logo, colour, type and visual direction",
          "Brand kits and focused refreshes when a full rebrand is unnecessary",
        ],
      },
      {
        id: "content",
        image: null,
        title: "Content & media",
        deliverables: [
          "Website and channel copy built around the real story",
          "Photo and video direction, production when scoped, or reuse of what already exists",
          "Templates and a consistent content direction your team can keep using",
        ],
      },
      {
        id: "channels",
        image: null,
        title: "Discovery & channels",
        deliverables: [
          "Google Business Profile, Maps and the places travellers actually search",
          "Booking, Agoda, TripAdvisor and other relevant platforms aligned with your own presence",
          "A clearer route from discovery to direct contact or booking",
        ],
      },
      {
        id: "growth",
        image: null,
        title: "Growth & acquisition",
        deliverables: [
          "Paid traffic and campaigns when the digital foundation is ready",
          "Analytics and measurement that answer useful business questions",
          "Broader SEO and acquisition work when there is a clear reason to invest in it",
        ],
      },
      {
        id: "systems",
        image: null,
        title: "Automation & systems",
        deliverables: [
          "Enquiry, lead and follow-up automations",
          "CRM, integrations and simple internal workflows",
          "Technical solutions for recurring operational problems within the scope we can support",
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

  cases: {
    title: "Selected work",
    lead: "Shipped end to end — positioning, brand, build and the tools that make it useful.",
    emptyNote:
      "Our first case studies are being written up. Until they're real we'd rather show you the method than invent results — ask us and we'll walk you through work in progress.",
    items: [
      {
        published: true,
        client: "DLT Academy",
        type: "Our own project · built by Tiago",
        location: "dlt.academy",
        href: "https://dlt.academy/",
        challenge:
          "Financial decisions get made on gut feeling, because the tools that would help are behind a signup, a paywall or a spreadsheet nobody opens.",
        approach:
          "Positioning, brand and platform: a portal plus four interactive decision tools, each answering one real question in under two minutes. Every answer is worked out in the visitor's browser.",
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

  packages: {
    title: "Built around the problem, not around a package",
    lead:
      "Start with the Field Check. We identify the bottleneck and recommend the smallest useful scope instead of asking you to choose a package before we understand the business.",
    items: [
      {
        id: "focused",
        name: "Focused project",
        forWho: "For one clear, controlled problem that does not need a full rebuild.",
        priceCustom: "Scoped after the Field Check",
        timeline: "One focused scope",
        includes: [
          "A small site, landing page or essential direct presence",
          "A complete website when the website is the main bottleneck",
          "A brand identity or focused refresh",
          "A specific intervention in one digital front",
        ],
      },
      {
        id: "rebuild",
        name: "Full rebuild",
        forWho: "When the website, brand, content and channels need to be reorganized together.",
        priceCustom: "Scope built around the rebuild",
        timeline: "Multi-part project",
        includes: [
          "Website and direct contact or booking path",
          "Brand identity or major refresh where needed",
          "Content and media direction around the same story",
          "Google, social and booking channels aligned with the new presence",
        ],
      },
      {
        id: "business",
        name: "Business / custom",
        forWho: "For larger, recurring or more technical needs that do not fit a fixed build.",
        priceCustom: "Custom scope",
        timeline: "Defined with you",
        includes: [
          "Growth, campaigns, analytics and ongoing acquisition",
          "Automations, CRM, integrations and internal systems",
          "Multiple properties, websites or more complex digital structures",
          "Ongoing SEO, maintenance or evolution when the business needs continuity",
        ],
        cta: "Talk about your project",
      },
    ],
    note:
      "The Field Check is the starting point. Once we understand the problem, we recommend a scope and send a one-page proposal.",
  },

  proposal: {
    title: "Get a Field Check",
    lead:
      "Tell us a little about the place. We'll use the public information already online to review up to three practical points: what is working, what may be getting in the way, and what we would look at first. No call required.",
  },

  contact: {
    title: "Talk to us",
    lead: "Tell us where you are and what isn't working. We answer every message ourselves.",
    pending: "Contact details are being set up — they go live with the site.",
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
