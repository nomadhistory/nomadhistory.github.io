// ============================================================
// STORY DIAGNOSTIC ENGINE — pure logic, no DOM.
//
// The MVP is intentionally self-reported: it measures the distance
// between the story a business says it has and what it says its
// current digital presence communicates. A later version can add a
// public-web audit without changing the interface contract below.
// ============================================================

(function (global) {
  "use strict";

  const PROFILE_LABELS = {
    host: "The Host",
    artisan: "The Artisan",
    expert: "The Expert",
    explorer: "The Explorer",
    local: "The Local Icon",
    founder: "The Founder Story",
    legacy: "The Family Legacy",
    innovator: "The Innovator",
  };

  const PROFILE_DESCRIPTIONS = {
    host: "People return because the experience feels personal, warm and human.",
    artisan: "Quality, craft and the way things are made are central to the value of the business.",
    expert: "Trust comes from knowledge, competence and the confidence that the business knows its field deeply.",
    explorer: "The business is driven by discovery, experience and a sense of possibility.",
    local: "Its strongest advantage is the relationship with a place, neighbourhood or community.",
    founder: "The founder's motivation and point of view are a meaningful part of why the business exists.",
    legacy: "Time, continuity and family or local memory give the business a story competitors cannot manufacture.",
    innovator: "The business stands out by solving a problem differently or refusing to look like the category around it.",
  };

  const STORY_ASSET_LABELS = {
    founder: "the founder story",
    team: "the people behind the business",
    process: "the process or craft behind the experience",
    local: "the relationship with the local community",
    customers: "stories from returning customers",
    archive: "old photos, milestones or historical material",
    values: "the values and choices behind the business",
  };

  const CHANNEL_LABELS = {
    website: "website",
    instagram: "Instagram",
    google: "Google Maps / Search",
    ota: "booking or travel platforms",
    facebook: "Facebook",
    tiktok: "TikTok",
    whatsapp: "direct messaging",
  };

  const DIGITAL_SHOWS_LABELS = {
    product: "products, rooms, menus or prices",
    place: "the physical place and visual atmosphere",
    people: "the people behind the business",
    story: "the origin and story of the business",
    experience: "the customer or guest experience",
    inconsistent: "a mix of outdated or inconsistent information",
    none: "almost nothing yet",
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round5(value) {
    return Math.round(value / 5) * 5;
  }

  function includes(list, value) {
    return Array.isArray(list) && list.indexOf(value) !== -1;
  }

  function countStoryAssets(answers) {
    return (answers.storyAssets || []).filter((x) => x !== "none").length;
  }

  function countChannels(answers) {
    return (answers.channels || []).filter((x) => x !== "none").length;
  }

  function profileScores(answers) {
    const score = {
      host: 0,
      artisan: 0,
      expert: 0,
      explorer: 0,
      local: 0,
      founder: 0,
      legacy: 0,
      innovator: 0,
    };

    const personalities = answers.personality || [];

    if (includes(personalities, "warm")) score.host += 4;
    if (includes(personalities, "expert")) score.expert += 4;
    if (includes(personalities, "adventurous")) score.explorer += 4;
    if (includes(personalities, "refined")) score.artisan += 2;
    if (includes(personalities, "creative")) {
      score.artisan += 2;
      score.innovator += 2;
    }
    if (includes(personalities, "local")) score.local += 4;
    if (includes(personalities, "traditional")) score.legacy += 4;
    if (includes(personalities, "bold")) score.innovator += 4;

    if (answers.origin === "family") score.legacy += 6;
    if (answers.origin === "passion") {
      score.founder += 5;
      score.explorer += 2;
    }
    if (answers.origin === "community") score.local += 6;
    if (answers.origin === "problem") {
      score.innovator += 5;
      score.expert += 2;
    }
    if (answers.origin === "opportunity") score.innovator += 2;

    if (answers.differentiator === "service") score.host += 6;
    if (answers.differentiator === "craft") score.artisan += 6;
    if (answers.differentiator === "atmosphere") {
      score.host += 3;
      score.explorer += 3;
    }
    if (answers.differentiator === "expertise") score.expert += 6;
    if (answers.differentiator === "story") {
      score.legacy += 3;
      score.founder += 3;
      score.local += 2;
    }
    if (answers.differentiator === "convenience") score.innovator += 2;

    if (includes(answers.storyAssets, "founder")) score.founder += 4;
    if (includes(answers.storyAssets, "team")) score.host += 2;
    if (includes(answers.storyAssets, "process")) score.artisan += 4;
    if (includes(answers.storyAssets, "local")) score.local += 4;
    if (includes(answers.storyAssets, "customers")) score.host += 3;
    if (includes(answers.storyAssets, "archive")) score.legacy += 4;
    if (includes(answers.storyAssets, "values")) {
      score.founder += 2;
      score.innovator += 2;
    }

    if (answers.age === "6-10") {
      score.local += 1;
      score.legacy += 1;
    }
    if (answers.age === "10+") {
      score.local += 2;
      score.legacy += 4;
    }

    return score;
  }

  function pickProfiles(answers) {
    const scored = profileScores(answers);
    const ranked = Object.keys(scored).sort((a, b) => scored[b] - scored[a]);
    const primary = ranked[0] || "founder";
    let secondary = ranked[1] || "host";

    if (scored[secondary] === 0) {
      secondary = primary === "host" ? "local" : "host";
    }

    return {
      primary: {
        id: primary,
        label: PROFILE_LABELS[primary],
        description: PROFILE_DESCRIPTIONS[primary],
        score: scored[primary],
      },
      secondary: {
        id: secondary,
        label: PROFILE_LABELS[secondary],
        description: PROFILE_DESCRIPTIONS[secondary],
        score: scored[secondary],
      },
    };
  }

  function identityScore(answers) {
    let score = 38;
    const personalityCount = (answers.personality || []).length;

    if (answers.origin && answers.origin !== "other") score += 12;
    if (["family", "passion", "community", "problem"].includes(answers.origin)) score += 6;
    if (answers.differentiator && answers.differentiator !== "convenience") score += 12;
    score += Math.min(personalityCount, 3) * 6;
    if (countStoryAssets(answers) >= 2) score += 8;

    return round5(clamp(score, 30, 100));
  }

  function storyAvailableScore(answers) {
    let score = 25;
    const assets = countStoryAssets(answers);

    if (answers.age === "2-5") score += 8;
    if (answers.age === "6-10") score += 14;
    if (answers.age === "10+") score += 20;
    if (["family", "passion", "community", "problem"].includes(answers.origin)) score += 15;
    if (answers.differentiator === "story") score += 10;
    score += Math.min(assets, 5) * 8;

    return round5(clamp(score, 20, 100));
  }

  function storyVisibleScore(answers) {
    if (countChannels(answers) === 0) return 10;

    let score = 20;
    const clarity = Number(answers.clarity || 1);
    const match = Number(answers.digitalMatch || 1);

    if (answers.digitalShows === "story") score += 32;
    if (answers.digitalShows === "people") score += 20;
    if (answers.digitalShows === "experience") score += 18;
    if (answers.digitalShows === "place") score += 10;
    if (answers.digitalShows === "product") score += 4;
    if (answers.digitalShows === "inconsistent") score -= 8;

    score += (clarity - 1) * 7;
    score += (match - 1) * 4;

    return round5(clamp(score, 5, 100));
  }

  function personalityDigitalScore(answers) {
    if (countChannels(answers) === 0) return 10;

    let score = 18;
    const match = Number(answers.digitalMatch || 1);
    const clarity = Number(answers.clarity || 1);

    score += (match - 1) * 13;
    score += (clarity - 1) * 5;
    if (["people", "story", "experience"].includes(answers.digitalShows)) score += 10;
    if (answers.digitalShows === "inconsistent") score -= 10;

    return round5(clamp(score, 5, 100));
  }

  function trustScore(answers) {
    let score = 25;
    const channels = answers.channels || [];

    if (includes(channels, "google")) score += 12;
    if (includes(channels, "ota")) score += 8;
    if (includes(channels, "website")) score += 8;
    if (includes(channels, "instagram")) score += 5;

    if (answers.reviews === "strong") score += 38;
    if (answers.reviews === "some") score += 22;
    if (answers.reviews === "weak") score += 7;
    if (answers.reviews === "unknown") score += 0;

    if (answers.digitalShows === "experience") score += 8;
    if (answers.digitalShows === "people") score += 4;

    return round5(clamp(score, 10, 100));
  }

  function gapLevel(value) {
    if (value >= 50) return { id: "large", label: "Large narrative gap" };
    if (value >= 30) return { id: "clear", label: "Clear narrative gap" };
    if (value >= 15) return { id: "moderate", label: "Moderate narrative gap" };
    return { id: "small", label: "Small narrative gap" };
  }

  function strongestStory(answers) {
    const assets = answers.storyAssets || [];

    if (answers.origin === "family" && includes(assets, "archive")) {
      return "Continuity and memory: the business has a legacy competitors cannot recreate overnight.";
    }
    if (answers.origin === "community" || includes(assets, "local")) {
      return "Place and belonging: the relationship with the local community is a distinctive story asset.";
    }
    if (answers.origin === "passion" || includes(assets, "founder")) {
      return "Why it exists: the founder story gives the business a human reason to be remembered.";
    }
    if (includes(assets, "process")) {
      return "How it is made: the process behind the experience can turn quality from a claim into something visible.";
    }
    if (includes(assets, "customers")) {
      return "Who comes back: returning customers are evidence of a relationship, not just a transaction.";
    }
    if (includes(assets, "team")) {
      return "The people: the team is a stronger source of personality than generic promotional content.";
    }
    if (includes(assets, "values")) {
      return "The choices behind the business: values can explain why the experience feels different.";
    }
    return "The differentiator itself: the clearest starting point is explaining why customers choose this business over nearby alternatives.";
  }

  function digitalMessage(answers) {
    const channels = countChannels(answers);
    if (channels === 0) {
      return "There is almost no digital layer yet, so the business story is largely invisible before someone arrives or gets referred directly.";
    }

    const shown = DIGITAL_SHOWS_LABELS[answers.digitalShows] || "the offer";
    const clarity = Number(answers.clarity || 1);
    const match = Number(answers.digitalMatch || 1);

    if (answers.digitalShows === "inconsistent") {
      return "The current presence mainly communicates inconsistency. A visitor has to assemble the story from fragments instead of understanding it quickly.";
    }
    if (clarity <= 2 || match <= 2) {
      return `Online, people mostly see ${shown}, but the presence does not yet feel like a reliable translation of the real business.`;
    }
    if (answers.digitalShows === "story" && clarity >= 4 && match >= 4) {
      return "The digital presence is already doing an important job well: it communicates the story and feels close to the real experience.";
    }
    return `Online, people mostly see ${shown}. That is useful, but it may not be carrying the full reason someone should remember or choose the business.`;
  }

  function gapMessage(gap, scores) {
    if (gap >= 50) {
      return "The business appears to have far more story than its digital presence currently communicates. The main opportunity is not inventing a brand story; it is making an existing one visible.";
    }
    if (gap >= 30) {
      return "There is a meaningful difference between the strength of the business identity and how much of it appears online. A clearer narrative system could close that distance.";
    }
    if (gap >= 15) {
      return "The core story is partially visible, but some of the strongest human or distinctive signals are still being lost between the real experience and the digital one.";
    }
    if (scores.storyVisible >= 75) {
      return "The story is already translating online relatively well. The next opportunity is consistency, proof and conversion rather than a complete narrative rebuild.";
    }
    return "The self-reported gap is small, but the digital presence is still worth checking against what a first-time visitor actually sees in public channels.";
  }

  function buildOpportunities(answers, scores) {
    const opportunities = [];
    const assets = answers.storyAssets || [];

    function add(title, detail) {
      if (!opportunities.some((x) => x.title === title)) {
        opportunities.push({ title, detail });
      }
    }

    if (countChannels(answers) === 0) {
      add("Build a clear public starting point", "Create one reliable place where a new visitor can understand what the business is, why it is different and how to take the next step.");
    }

    if (includes(assets, "founder") && answers.digitalShows !== "story") {
      add("Make the origin visible", "Turn the founder story into a concise public narrative instead of leaving it only in conversations with existing customers.");
    }

    if ((includes(assets, "team") || answers.differentiator === "service") && answers.digitalShows !== "people") {
      add("Show the people behind the experience", "If service is part of the advantage, faces, voices and small human details should appear before the customer arrives.");
    }

    if (includes(assets, "process") && !["story", "people"].includes(answers.digitalShows)) {
      add("Turn process into proof", "Show how the work is done so quality becomes observable rather than another generic claim.");
    }

    if ((includes(assets, "local") || answers.origin === "community") && answers.digitalShows !== "story") {
      add("Own the local story", "Connect the business more visibly to its neighbourhood, region or community so location becomes meaning, not just an address.");
    }

    if ((includes(assets, "archive") || answers.age === "10+") && answers.digitalShows !== "story") {
      add("Use the history you already have", "Dates, old images and milestones can create credibility and distinctiveness that newer competitors cannot reproduce.");
    }

    if (scores.trust < 55) {
      add("Strengthen visible proof", "Make recent reviews, returning customers or other trust signals easier to find at the moment someone is deciding.");
    }

    if (scores.personalityDigital < 55 && countChannels(answers) > 1) {
      add("Make every channel feel like the same business", "Use a consistent voice, visual direction and story hierarchy across the places where customers discover you.");
    }

    if (scores.storyVisible < 55 && answers.digitalShows === "product") {
      add("Move beyond the catalogue", "Keep the practical information, but add the people, origin and experience that explain why this offer deserves preference.");
    }

    if (opportunities.length < 3) {
      add("Test the first 60 seconds", "Ask whether a new visitor can understand what makes the business different without already knowing its reputation offline.");
    }

    if (opportunities.length < 3) {
      add("Connect story to the next action", "The narrative should lead naturally to a booking, visit, enquiry or direct contact instead of ending as decoration.");
    }

    return opportunities.slice(0, 3);
  }

  function buildSummary(answers, result) {
    const name = (answers.businessName || "This business").trim() || "This business";
    const channels = (answers.channels || [])
      .filter((x) => x !== "none")
      .map((x) => CHANNEL_LABELS[x] || x)
      .join(", ");

    return [
      `${name} — Story Diagnostic`,
      `Narrative profile: ${result.profiles.primary.label} + ${result.profiles.secondary.label}`,
      `Identity: ${result.scores.identity}/100`,
      `Story available: ${result.scores.storyAvailable}/100`,
      `Story visible online: ${result.scores.storyVisible}/100`,
      `Digital personality: ${result.scores.personalityDigital}/100`,
      `Trust / social proof: ${result.scores.trust}/100`,
      `Storytelling Gap: ${result.gap.value} points — ${result.gap.label}`,
      channels ? `Current channels: ${channels}` : "Current channels: almost none",
      `Strongest story signal: ${result.strongestStory}`,
      `Main finding: ${result.gapMessage}`,
      "",
      "This is a self-reported diagnostic, not an external audit of the public channels.",
    ].join("\n");
  }

  function buildDiagnosis(answers) {
    const profiles = pickProfiles(answers);
    const scores = {
      identity: identityScore(answers),
      storyAvailable: storyAvailableScore(answers),
      storyVisible: storyVisibleScore(answers),
      personalityDigital: personalityDigitalScore(answers),
      trust: trustScore(answers),
    };

    const storyStrength = Math.round((scores.identity + scores.storyAvailable) / 2);
    const digitalTranslation = Math.round((scores.storyVisible + scores.personalityDigital) / 2);
    const gapValue = round5(clamp(storyStrength - digitalTranslation, 0, 100));
    const level = gapLevel(gapValue);

    const result = {
      profiles,
      scores,
      gap: {
        value: gapValue,
        id: level.id,
        label: level.label,
      },
      strongestStory: strongestStory(answers),
      digitalMessage: digitalMessage(answers),
      gapMessage: gapMessage(gapValue, scores),
      opportunities: buildOpportunities(answers, scores),
    };

    result.summary = buildSummary(answers, result);
    return result;
  }

  const api = {
    PROFILE_LABELS,
    PROFILE_DESCRIPTIONS,
    STORY_ASSET_LABELS,
    CHANNEL_LABELS,
    DIGITAL_SHOWS_LABELS,
    buildDiagnosis,
    profileScores,
  };

  global.StoryDiagnosticEngine = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
