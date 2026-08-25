(function (global) {
  "use strict";

  const LABELS = {
    profiles: {
      host: ["The Host", "People remember how the place made them feel: welcomed, seen and personally looked after."],
      artisan: ["The Artisan", "The value lives in craft, detail and the way the experience is made."],
      expert: ["The Expert", "Trust comes from knowledge, judgement and confidence in the people behind the business."],
      explorer: ["The Explorer", "Discovery, experience and a sense of possibility are central to the business."],
      local: ["The Local Icon", "The strongest advantage is belonging to a neighbourhood, landscape, culture or community."],
      founder: ["The Founder Story", "The reason someone created this business is part of the reason customers can care about it."],
      legacy: ["The Family Legacy", "Time, continuity and memory give the business a story newer competitors cannot manufacture."],
      innovator: ["The Innovator", "Someone looked at the usual way of doing things and chose another route."],
    },
    channels: {
      website: "website",
      instagram: "Instagram",
      google: "Google Maps / Search",
      ota: "booking or travel platforms",
      facebook: "Facebook",
      tiktok: "TikTok",
      whatsapp: "direct messaging",
    },
    digital: {
      product: "products, rooms, menus, prices or promotions",
      place: "the physical place and visual atmosphere",
      people: "the people behind the business",
      story: "the origin and story of the business",
      experience: "the guest or customer experience",
      inconsistent: "outdated or inconsistent fragments",
      none: "almost nothing yet",
    },
  };

  const clean = (list) => (Array.isArray(list) ? list : []).filter((x) => x !== "none");
  const has = (list, value) => Array.isArray(list) && list.includes(value);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const round5 = (value) => Math.round(value / 5) * 5;

  function profileScores(a) {
    const s = { host: 0, artisan: 0, expert: 0, explorer: 0, local: 0, founder: 0, legacy: 0, innovator: 0 };
    const p = a.personality || [];
    if (has(p, "warm")) s.host += 4;
    if (has(p, "expert")) s.expert += 4;
    if (has(p, "adventurous")) s.explorer += 4;
    if (has(p, "refined")) s.artisan += 3;
    if (has(p, "creative")) { s.artisan += 2; s.innovator += 2; }
    if (has(p, "local")) s.local += 4;
    if (has(p, "traditional")) s.legacy += 4;
    if (has(p, "bold")) s.innovator += 4;

    if (a.origin === "family") s.legacy += 6;
    if (a.origin === "passion") { s.founder += 5; s.explorer += 2; }
    if (a.origin === "community") s.local += 6;
    if (a.origin === "problem") { s.innovator += 5; s.expert += 2; }
    if (a.origin === "opportunity") s.innovator += 2;

    if (a.differentiator === "service") s.host += 6;
    if (a.differentiator === "craft") s.artisan += 6;
    if (a.differentiator === "atmosphere") { s.host += 3; s.explorer += 3; }
    if (a.differentiator === "expertise") s.expert += 6;
    if (a.differentiator === "story") { s.legacy += 3; s.founder += 3; s.local += 2; }

    const anchor = a.storyAnchor;
    if (anchor === "person") { s.founder += 4; s.host += 1; }
    if (anchor === "place") { s.local += 4; s.explorer += 2; }
    if (anchor === "craft") { s.artisan += 4; s.expert += 2; }
    if (anchor === "community") { s.local += 4; s.host += 2; }
    if (anchor === "idea") { s.innovator += 4; s.expert += 2; }
    if (anchor === "memory") { s.legacy += 4; s.host += 1; }

    const assets = clean(a.storyAssets);
    if (has(assets, "founder")) s.founder += 4;
    if (has(assets, "team")) s.host += 2;
    if (has(assets, "process")) s.artisan += 4;
    if (has(assets, "local")) s.local += 4;
    if (has(assets, "customers")) s.host += 3;
    if (has(assets, "archive")) s.legacy += 4;
    if (has(assets, "values")) { s.founder += 2; s.innovator += 2; }
    if (a.age === "10+") { s.legacy += 4; s.local += 2; }
    return s;
  }

  function profiles(a) {
    const s = profileScores(a);
    const ranked = Object.keys(s).sort((x, y) => s[y] - s[x]);
    const make = (id) => ({ id, label: LABELS.profiles[id][0], description: LABELS.profiles[id][1], score: s[id] });
    const primary = ranked[0] || "founder";
    let secondary = ranked[1] || "host";
    if (!s[secondary]) secondary = primary === "host" ? "local" : "host";
    return { primary: make(primary), secondary: make(secondary) };
  }

  function identity(a) {
    let n = 32;
    if (a.origin && a.origin !== "other") n += 12;
    if (["family", "passion", "community", "problem"].includes(a.origin)) n += 6;
    if (a.storyAnchor) n += 8;
    if (a.differentiator && a.differentiator !== "convenience") n += 12;
    n += Math.min((a.personality || []).length, 3) * 6;
    if (clean(a.storyAssets).length >= 2) n += 8;
    return round5(clamp(n, 25, 100));
  }

  function storyAvailable(a) {
    let n = 22;
    if (a.age === "2-5") n += 8;
    if (a.age === "6-10") n += 14;
    if (a.age === "10+") n += 20;
    if (["family", "passion", "community", "problem"].includes(a.origin)) n += 14;
    if (a.storyAnchor) n += 6;
    if (a.differentiator === "story") n += 8;
    n += Math.min(clean(a.storyAssets).length, 5) * 8;
    return round5(clamp(n, 20, 100));
  }

  function coverage(a) {
    const available = clean(a.storyAssets);
    const visible = clean(a.visibleAssets);
    if (!available.length) return 0;
    return available.filter((x) => has(visible, x)).length / available.length;
  }

  function storyVisible(a) {
    if (!clean(a.channels).length) return 10;
    let n = 12 + coverage(a) * 42;
    const clarity = Number(a.clarity || 1);
    const match = Number(a.digitalMatch || 1);
    if (a.digitalShows === "story") n += 18;
    if (a.digitalShows === "people") n += 12;
    if (a.digitalShows === "experience") n += 10;
    if (a.digitalShows === "place") n += 6;
    if (a.digitalShows === "product") n += 2;
    if (a.digitalShows === "inconsistent") n -= 8;
    n += (clarity - 1) * 5 + (match - 1) * 3;
    return round5(clamp(n, 5, 100));
  }

  function digitalPersonality(a) {
    if (!clean(a.channels).length) return 10;
    let n = 12 + coverage(a) * 18;
    n += (Number(a.digitalMatch || 1) - 1) * 12;
    n += (Number(a.clarity || 1) - 1) * 4;
    if (["people", "story", "experience"].includes(a.digitalShows)) n += 8;
    if (a.digitalShows === "inconsistent") n -= 10;
    return round5(clamp(n, 5, 100));
  }

  function trust(a) {
    let n = 22;
    const channels = a.channels || [];
    if (has(channels, "google")) n += 12;
    if (has(channels, "ota")) n += 8;
    if (has(channels, "website")) n += 8;
    if (has(channels, "instagram")) n += 5;
    if (a.reviews === "strong") n += 38;
    if (a.reviews === "some") n += 22;
    if (a.reviews === "weak") n += 7;
    if (has(clean(a.visibleAssets), "customers")) n += 8;
    return round5(clamp(n, 10, 100));
  }

  function strongestStory(a) {
    const assets = clean(a.storyAssets);
    if (a.storyAnchor === "memory" || (a.origin === "family" && has(assets, "archive"))) return "Continuity and memory. There is a before-and-after here — something the business can show, remember and pass forward.";
    if (["place", "community"].includes(a.storyAnchor) || a.origin === "community" || has(assets, "local")) return "Place and belonging. The business seems inseparable from where it is and the people around it.";
    if (a.storyAnchor === "person" || a.origin === "passion" || has(assets, "founder")) return "Why it exists. The person or motivation behind the beginning gives the business a human reason to be remembered.";
    if (a.storyAnchor === "craft" || has(assets, "process")) return "How it is made. The process can turn quality from a claim into something people can see and understand.";
    if (a.storyAnchor === "idea" || a.origin === "problem") return "A point of view. Someone believed the usual way was not good enough and built an alternative around that belief.";
    if (has(assets, "customers")) return "Who comes back. Returning customers are evidence of a relationship, not just a transaction.";
    return "The experience itself. The clearest starting point is the reason your best customers would tell a friend to choose you.";
  }

  function level(gap) {
    if (gap >= 50) return ["large", "Large narrative gap"];
    if (gap >= 30) return ["clear", "Clear narrative gap"];
    if (gap >= 15) return ["moderate", "Moderate narrative gap"];
    return ["small", "Small narrative gap"];
  }

  function finding(gap, scores) {
    if (gap >= 50) return "There appears to be much more story inside the business than a stranger can discover online. The opportunity is not to invent a personality; it is to stop losing the one that already exists.";
    if (gap >= 30) return "The real business seems richer than its digital version. Several reasons people could care about it are being weakened or left offline.";
    if (gap >= 15) return "The core story is making part of the journey online, but some of the most human or distinctive signals are still getting lost on the way.";
    if (scores.storyVisible >= 75) return "The story seems to travel online relatively well. The next question is consistency, trust and turning attention into action.";
    return "The self-reported gap is small. An external check is still useful because owners read their own pages with context a first-time visitor does not have.";
  }

  function digitalMessage(a) {
    if (!clean(a.channels).length) return "Someone who has never heard of the business has almost no digital version of it to meet yet.";
    const available = clean(a.storyAssets);
    const visible = clean(a.visibleAssets);
    const overlap = available.filter((x) => has(visible, x)).length;
    const shown = LABELS.digital[a.digitalShows] || "the offer";
    if (available.length) return `A stranger mostly meets ${shown}. Of the ${available.length} real story signals identified inside the business, ${overlap} appear to be clearly visible online today.`;
    return `A stranger mostly meets ${shown}. The presence may be functional, but there is little distinctive story material being carried through yet.`;
  }

  function opportunities(a, scores) {
    const out = [];
    const available = clean(a.storyAssets);
    const visible = clean(a.visibleAssets);
    const missing = (x) => has(available, x) && !has(visible, x);
    const add = (title, detail) => { if (!out.some((x) => x.title === title)) out.push({ title, detail }); };

    if (!clean(a.channels).length) add("Give the story a public front door", "Create one reliable place where a stranger can understand what this business is, why it matters and what to do next.");
    if (missing("founder")) add("Let the beginning leave the back room", "The origin exists, but a new customer cannot easily find it. A concise version can give the business a human reason to exist.");
    if (missing("team")) add("Put people back into the picture", "If people shape the experience, faces, voices and human details should appear before the customer arrives.");
    if (missing("process")) add("Turn craft into evidence", "Show how the work is done so quality becomes observable instead of sounding like another generic promise.");
    if (missing("local")) add("Own the relationship with place", "Make the connection to neighbourhood, landscape, culture or community part of what a stranger discovers.");
    if (missing("customers")) add("Let customers carry part of the story", "Real voices can prove what the business means to people without forcing the brand to say everything about itself.");
    if (missing("archive")) add("Use the history that already exists", "Old images and milestones can create credibility and distinction newer competitors cannot reproduce.");
    if (missing("values")) add("Show the choices behind the values", "Values become believable when customers can see the real decisions they influence.");
    if (scores.trust < 55) add("Make trust easier to find", "Bring recent reviews or other proof closer to the moment a new customer is deciding whether to believe the promise.");
    if (out.length < 3) add("Run the sixty-second stranger test", "Open the public presence as if you knew nothing. Can you understand who this place is for and why someone would remember it?");
    if (out.length < 3) add("Connect meaning to the next action", "The story should make the visit, booking or direct contact feel like the natural continuation of what the customer just discovered.");
    return out.slice(0, 3);
  }

  function buildStoryPreview(a) {
    const p = profiles(a);
    const potential = Math.round((identity(a) + storyAvailable(a)) / 2);
    return { profiles: p, storyPotential: potential, strongestStory: strongestStory(a) };
  }

  function buildDiagnosis(a) {
    const p = profiles(a);
    const scores = {
      identity: identity(a),
      storyAvailable: storyAvailable(a),
      storyVisible: storyVisible(a),
      personalityDigital: digitalPersonality(a),
      trust: trust(a),
    };
    const storyPotential = Math.round((scores.identity + scores.storyAvailable) / 2);
    const digitalTranslation = Math.round((scores.storyVisible + scores.personalityDigital) / 2);
    const gapValue = round5(clamp(storyPotential - digitalTranslation, 0, 100));
    const gapLevel = level(gapValue);
    const result = {
      profiles: p,
      scores,
      storyPotential,
      digitalTranslation,
      gap: { value: gapValue, id: gapLevel[0], label: gapLevel[1] },
      strongestStory: strongestStory(a),
      digitalMessage: digitalMessage(a),
      gapMessage: finding(gapValue, scores),
      opportunities: opportunities(a, scores),
      coverage: coverage(a),
    };
    const name = (a.businessName || "This business").trim() || "This business";
    const available = clean(a.storyAssets);
    const visible = clean(a.visibleAssets);
    const overlap = available.filter((x) => has(visible, x)).length;
    result.summary = [
      `${name} — Historia Nomade Story Check`,
      `Narrative profile: ${p.primary.label} + ${p.secondary.label}`,
      `Story Potential: ${storyPotential}/100`,
      `Digital Translation: ${digitalTranslation}/100`,
      `Storytelling Gap: ${gapValue} points — ${gapLevel[1]}`,
      `Story signals visible online: ${overlap}/${available.length || 0}`,
      `Identity: ${scores.identity}/100`,
      `Story available: ${scores.storyAvailable}/100`,
      `Story visible online: ${scores.storyVisible}/100`,
      `Digital personality: ${scores.personalityDigital}/100`,
      `Trust / social proof: ${scores.trust}/100`,
      `Main finding: ${result.gapMessage}`,
      "",
      "Self-reported diagnostic hypothesis — not an external audit.",
    ].join("\n");
    return result;
  }

  const api = { LABELS, profileScores, buildStoryPreview, buildDiagnosis, coverage };
  global.StoryCheckEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
