// ============================================================
// STORY CHECK — conversational interface.
// The scoring logic lives in ../js/story-check-engine.js.
// ============================================================

(function () {
  "use strict";

  const root = document.getElementById("diagnostic-root");
  const engine = window.StoryCheckEngine;
  if (!root || !engine) return;

  const answers = {};
  let stepId = "businessType";
  const history = [];

  function onlyNone(list) {
    return Array.isArray(list) && list.length === 1 && list[0] === "none";
  }

  function visibleStoryOptions() {
    const labels = {
      founder: ["The founder or origin story", "Why this place exists and what brought it into being."],
      team: ["The people behind the place", "Owners, team members, voices or characters a stranger can actually meet online."],
      process: ["How things are done", "Craft, preparation, sourcing, rituals or the process behind the experience."],
      local: ["The relationship with this place", "Neighbourhood, region, producers, culture, landscape or community."],
      customers: ["Stories from people who come back", "Regulars, repeat guests, testimonials or recognisable customer stories."],
      archive: ["History you can actually see", "Old photos, milestones, objects or material from earlier chapters."],
      values: ["The choices behind your values", "Real decisions that show what matters to the business."],
    };
    const options = (answers.storyAssets || [])
      .filter(function (value) { return value !== "none" && labels[value]; })
      .map(function (value) { return [value, labels[value][0], labels[value][1]]; });
    options.push(["none", "Almost none of those stories are easy to find", "They may exist in the real business, but a stranger would need someone to explain them."]);
    return options;
  }

  const QUESTIONS = {
    businessType: {
      section: "Your place",
      title: "What kind of place are we getting to know?",
      help: "Pick the closest fit. We are more interested in how the place feels than in the perfect category.",
      type: "single",
      options: [
        ["hotel", "Hotel, guesthouse or B&B", "A place people stay overnight."],
        ["hostel", "Hostel", "A social stay, community or traveller base."],
        ["restaurant", "Restaurant, café or bar", "A place people come to eat, drink or spend time."],
        ["experience", "Tours or experiences", "Something people come to do, discover or learn."],
        ["other", "Something else", "Still a place or experience with a story worth finding."],
      ],
      next: "origin",
    },
    origin: {
      section: "Where it began",
      title: "Take us back to the beginning. Why did this place start?",
      help: "Not the polished About-page version — just the reason that feels most true.",
      type: "single",
      options: [
        ["family", "It grew from a family story", "Something inherited, continued or built together."],
        ["passion", "Someone cared enough to make it real", "A personal interest, dream or change of life became the business."],
        ["community", "It belongs to this place", "The neighbourhood, region or local community is part of why it exists."],
        ["problem", "We wanted to do something differently", "There was a problem, frustration or missing experience worth fixing."],
        ["opportunity", "We saw a good opportunity", "The business came first; the deeper story may have grown later."],
        ["other", "It is a little harder to explain", "There is more than one beginning, or none of these quite fits."],
      ],
      next: "age",
    },
    age: {
      section: "Time",
      title: "How long has this story been unfolding?",
      help: "Time changes what a business can carry: memories, regulars, traditions, old photos and local recognition.",
      type: "single",
      options: [
        ["new", "Less than 2 years", "Still becoming itself."],
        ["2-5", "2–5 years", "Enough time for patterns and regulars to appear."],
        ["6-10", "6–10 years", "A real chapter of local memory."],
        ["10+", "More than 10 years", "There is history here, whether or not it has been documented."],
      ],
      next: "storyAnchor",
    },
    storyAnchor: {
      section: "The thread underneath",
      title: "If a curious guest stayed after closing and asked, “Why does this place matter to you?” — where would the story naturally go?",
      help: "Do not worry about sounding impressive. We are looking for the thread you would keep talking about without needing a marketing brief.",
      type: "single",
      options: [
        ["person", "To a person", "The founder, family or someone whose choices shaped the place."],
        ["place", "To the place itself", "The building, street, landscape, city or region is inseparable from the story."],
        ["craft", "To the way we do something", "A recipe, process, skill, ritual or standard that matters here."],
        ["community", "To the people around us", "Neighbours, regulars, producers, travellers or relationships built over time."],
        ["idea", "To an idea", "Something we wanted to change, prove, protect or create differently."],
        ["memory", "To a memory", "A moment, old chapter or piece of history that still explains the place today."],
      ],
      next: "differentiator",
    },
    differentiator: {
      section: "What people remember",
      title: "When people really love your place, what do they usually talk about?",
      help: "Think of a review, a returning guest or something people tell their friends — not what you wish they noticed.",
      type: "single",
      options: [
        ["service", "The way we make people feel", "Warmth, attention, welcome, care or personal service."],
        ["craft", "The quality and the way we do things", "Food, design, making, sourcing, details or craft."],
        ["atmosphere", "The feeling of being here", "Energy, setting, character or a sense that the place is unlike elsewhere."],
        ["expertise", "They trust what we know", "Knowledge, guidance, reliability or specialist experience."],
        ["story", "The story itself", "History, family, building, location or a memorable reason the place exists."],
        ["convenience", "Mostly the practical things", "Price, location, speed, availability or ease."],
      ],
      next: "personality",
    },
    personality: {
      section: "Personality",
      title: "If your place walked into a room, how would people describe it?",
      help: "Choose up to three. The interesting part is the combination, not finding one perfect word.",
      type: "multi",
      max: 3,
      options: [
        ["warm", "Warm", "People relax quickly and feel looked after."],
        ["expert", "Knowledgeable", "It knows what it is doing and earns trust."],
        ["adventurous", "Adventurous", "Curious, open, energetic or made for discovery."],
        ["refined", "Refined", "Thoughtful, careful and attentive to detail."],
        ["creative", "Creative", "There is a point of view rather than a formula."],
        ["local", "Rooted", "It feels connected to this particular place."],
        ["traditional", "Full of memory", "Continuity, ritual or history matters here."],
        ["bold", "A little rebellious", "It does not mind doing things differently from the category."],
      ],
      next: "storyAssets",
    },
    storyAssets: {
      section: "Stories already there",
      title: "Which stories are sitting inside the business, even if you rarely tell them online?",
      help: "Choose everything that genuinely exists. Imagine what someone could discover by spending an afternoon with you — these are raw materials, not marketing claims.",
      type: "multi",
      options: [
        ["founder", "Why the founder started it", "A decision, turning point, obsession or personal reason."],
        ["team", "The people behind the place", "Characters, relationships, ways of working or people guests remember."],
        ["process", "How things are actually done", "Craft, preparation, sourcing, rituals or details customers do not usually see."],
        ["local", "A relationship with the local place", "Neighbours, landscape, culture, producers, streets or community."],
        ["customers", "People who keep coming back", "Regulars, repeat guests and stories that only exist because of time."],
        ["archive", "Old photos, milestones or memories", "Material that proves the place has lived a life."],
        ["values", "Choices that reveal what you care about", "Things you do differently because they matter to you."],
        ["none", "Not much comes to mind yet", "That is useful to know too. A story can be found in the present, not only the past."],
      ],
      next: "checkpoint",
    },
    channels: {
      section: "Now, the internet",
      title: "Imagine someone who has never been there. Where can they meet you online?",
      help: "Choose the places that matter today — not accounts that technically exist but nobody uses.",
      type: "multi",
      options: [
        ["website", "Your own website", "A place you control."],
        ["instagram", "Instagram", "Posts, reels, stories or messages."],
        ["google", "Google Maps / Search", "Your listing, photos and reviews."],
        ["ota", "Booking or travel platforms", "Booking.com, Airbnb, TripAdvisor or similar."],
        ["facebook", "Facebook", "Page, posts, reviews or messages."],
        ["tiktok", "TikTok", "Short-form video and discovery."],
        ["whatsapp", "WhatsApp / direct messaging", "A direct path people use before buying or booking."],
        ["none", "Almost nowhere yet", "Most discovery still happens offline or through word of mouth."],
      ],
      next: function () {
        return onlyNone(answers.channels) ? "result" : "digitalShows";
      },
    },
    digitalShows: {
      section: "First impression",
      title: "If they gave you just 60 seconds online, what would they mostly see?",
      help: "This is not about whether the content is good. We want to know which version of the business gets the most space.",
      type: "single",
      options: [
        ["product", "What we sell", "Rooms, menu items, prices, packages, offers or practical information."],
        ["place", "What the place looks like", "Architecture, interiors, landscape or visual atmosphere."],
        ["people", "The people behind it", "Owners, team, guests, voices and human moments."],
        ["story", "Why this place exists", "Origin, history, values, local connection or the story behind the experience."],
        ["experience", "What it feels like to be here", "Guests, moments, reactions and the experience in use."],
        ["inconsistent", "A bit of everything from different eras", "Old information, mixed visuals or channels that do not quite agree."],
      ],
      next: function () {
        return onlyNone(answers.storyAssets) ? "digitalMatch" : "visibleAssets";
      },
    },
    visibleAssets: {
      section: "What made the journey",
      title: "Earlier you told us what stories exist inside the business. Which of those can a stranger actually find online today?",
      help: "Only count it if someone with no previous context could reasonably discover it without you standing beside them to explain it.",
      type: "multi",
      options: visibleStoryOptions,
      next: "digitalMatch",
    },
    digitalMatch: {
      section: "Translation",
      title: "When you look at the online version, how much does it feel like the real place?",
      help: "Think about tone, images, people, atmosphere and what matters once someone actually arrives — not only whether the information is correct.",
      type: "scale",
      low: "They feel like two different places",
      high: "It feels unmistakably like us",
      next: "clarity",
    },
    clarity: {
      section: "Difference",
      title: "Would a stranger understand why someone should choose you — not only what you sell?",
      help: "Answer for someone with no context, no recommendation from a friend and no previous visit.",
      type: "scale",
      low: "Probably not",
      high: "Almost immediately",
      next: "reviews",
    },
    reviews: {
      section: "Trust",
      title: "If that stranger likes what they see, how easy is it to find proof that real people believe it too?",
      help: "Recent reviews, returning guests, recommendations or other signs that people chose you and were glad they did.",
      type: "single",
      options: [
        ["strong", "Easy — and the proof is recent", "Trust is hard to miss."],
        ["some", "There is enough, but someone has to look", "The proof exists, but it is not doing much work on its own."],
        ["weak", "Very little", "The reputation may be stronger offline than online."],
        ["unknown", "I'm not really sure", "That uncertainty is useful information too."],
      ],
      next: "result",
    },
  };

  const ORDER = [
    "businessType", "origin", "age", "storyAnchor", "differentiator", "personality",
    "storyAssets", "channels", "digitalShows", "visibleAssets", "digitalMatch", "clarity", "reviews",
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function clear() {
    while (root.firstChild) root.removeChild(root.firstChild);
  }

  function progressValue() {
    if (stepId === "checkpoint") return 55;
    if (stepId === "result") return 100;
    const index = ORDER.indexOf(stepId);
    if (index < 0) return 0;
    return Math.round(((index + 1) / ORDER.length) * 100);
  }

  function renderProgress(section) {
    const progress = el("div", "diag-progress");
    const track = el("div", "diag-track");
    const fill = el("span");
    fill.style.width = progressValue() + "%";
    track.appendChild(fill);
    progress.appendChild(track);
    progress.appendChild(el("span", "diag-stage", section || "Story Check"));
    root.appendChild(progress);
  }

  function go(next) {
    history.push(stepId);
    stepId = typeof next === "function" ? next() : next;
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    if (!history.length) return;
    stepId = history.pop();
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function actionRow(canContinue, onContinue, label) {
    const row = el("div", "diag-actions");
    if (history.length) {
      const back = el("button", "btn btn-ghost", "Back");
      back.type = "button";
      back.addEventListener("click", goBack);
      row.appendChild(back);
    }
    row.appendChild(el("span", "spacer"));
    if (onContinue) {
      const next = el("button", "btn btn-primary", label || "Continue");
      next.type = "button";
      next.disabled = !canContinue;
      next.addEventListener("click", onContinue);
      row.appendChild(next);
    }
    root.appendChild(row);
  }

  function questionOptions(question) {
    return typeof question.options === "function" ? question.options() : question.options;
  }

  function renderSingle(question) {
    const options = el("div", "diag-options");
    questionOptions(question).forEach(function (opt, index) {
      const value = opt[0];
      const button = el("button", "diag-option");
      button.type = "button";
      button.setAttribute("aria-pressed", String(answers[stepId] === value));
      button.appendChild(el("span", "option-mark", String.fromCharCode(65 + index)));
      const copy = el("span", "option-copy");
      copy.appendChild(el("strong", null, opt[1]));
      if (opt[2]) copy.appendChild(el("small", null, opt[2]));
      button.appendChild(copy);
      button.addEventListener("click", function () {
        answers[stepId] = value;
        go(question.next);
      });
      options.appendChild(button);
    });
    root.appendChild(options);
    actionRow(false, null);
  }

  function renderMulti(question) {
    if (!Array.isArray(answers[stepId])) answers[stepId] = [];
    const list = answers[stepId];
    const options = el("div", "diag-options");

    questionOptions(question).forEach(function (opt, index) {
      const value = opt[0];
      const selected = list.indexOf(value) !== -1;
      const button = el("button", "diag-option");
      button.type = "button";
      button.setAttribute("aria-pressed", String(selected));
      button.appendChild(el("span", "option-mark", selected ? "✓" : String.fromCharCode(65 + index)));
      const copy = el("span", "option-copy");
      copy.appendChild(el("strong", null, opt[1]));
      if (opt[2]) copy.appendChild(el("small", null, opt[2]));
      button.appendChild(copy);
      button.addEventListener("click", function () {
        if (value === "none") {
          answers[stepId] = selected ? [] : ["none"];
          render();
          return;
        }
        const current = (answers[stepId] || []).filter(function (x) { return x !== "none"; });
        const at = current.indexOf(value);
        if (at >= 0) current.splice(at, 1);
        else if (!question.max || current.length < question.max) current.push(value);
        answers[stepId] = current;
        render();
      });
      options.appendChild(button);
    });

    root.appendChild(options);
    if (question.max) root.appendChild(el("p", "diag-limit", "Choose up to " + question.max + "."));
    actionRow((answers[stepId] || []).length > 0, function () { go(question.next); });
  }

  function renderScale(question) {
    const wrap = el("div", "scale-wrap");
    const labels = el("div", "scale-labels");
    labels.appendChild(el("span", null, question.low));
    labels.appendChild(el("span", null, question.high));
    wrap.appendChild(labels);
    const options = el("div", "scale-options");
    for (let value = 1; value <= 5; value += 1) {
      const button = el("button", "scale-option", String(value));
      button.type = "button";
      button.setAttribute("aria-label", value + " out of 5");
      button.setAttribute("aria-pressed", String(Number(answers[stepId]) === value));
      button.addEventListener("click", function () {
        answers[stepId] = value;
        go(question.next);
      });
      options.appendChild(button);
    }
    wrap.appendChild(options);
    root.appendChild(wrap);
    actionRow(false, null);
  }

  function renderQuestion(question) {
    clear();
    renderProgress(question.section);
    root.appendChild(el("p", "diag-kicker", question.section));
    root.appendChild(el("h2", "diag-question", question.title));
    root.appendChild(el("p", "diag-help", question.help));
    if (question.type === "single") renderSingle(question);
    if (question.type === "multi") renderMulti(question);
    if (question.type === "scale") renderScale(question);
  }

  function renderCheckpoint() {
    clear();
    renderProgress("Your story so far");
    const preview = engine.buildStoryPreview(answers);
    const box = el("div", "diag-checkpoint");
    box.appendChild(el("p", "diag-kicker", "Before we look at the internet"));
    box.appendChild(el("h2", null, "We can already see the shape of your story."));
    box.appendChild(el("p", null, "This is not a brand archetype we are trying to force onto you. It is a clue: the strongest patterns in what you have told us so far."));
    const pair = el("div", "profile-pair");
    pair.appendChild(el("span", "profile-chip", preview.profiles.primary.label));
    pair.appendChild(el("span", "profile-chip", preview.profiles.secondary.label));
    box.appendChild(pair);
    box.appendChild(el("p", null, preview.profiles.primary.description));
    const note = el("div", "checkpoint-note");
    note.appendChild(el("strong", null, "The story we would pull on first"));
    note.appendChild(el("p", null, preview.strongestStory));
    box.appendChild(note);
    box.appendChild(el("p", null, "Now we can ask the useful question: when someone meets this place through a screen, how much of that character makes it across?"));
    const button = el("button", "btn btn-primary", "Now meet the digital version");
    button.type = "button";
    button.addEventListener("click", function () { go("channels"); });
    box.appendChild(button);
    root.appendChild(box);

    const row = el("div", "diag-actions");
    const back = el("button", "btn btn-ghost", "Back");
    back.type = "button";
    back.addEventListener("click", goBack);
    row.appendChild(back);
    root.appendChild(row);
  }

  function scoreCard(label, value) {
    const card = el("div", "score-card");
    const top = el("div", "score-top");
    top.appendChild(el("span", null, label));
    top.appendChild(el("strong", null, value + "/100"));
    card.appendChild(top);
    const bar = el("div", "score-bar");
    const fill = el("span");
    fill.style.width = value + "%";
    bar.appendChild(fill);
    card.appendChild(bar);
    return card;
  }

  function renderResult() {
    clear();
    const result = engine.buildDiagnosis(answers);
    renderProgress("Your Story Check");

    const intro = el("div", "result-intro");
    intro.appendChild(el("p", "diag-kicker", "What your answers suggest"));
    intro.appendChild(el("h2", null, "There is a real business here. The question is how much of it survives online."));
    intro.appendChild(el("p", "result-summary", result.gapMessage));
    root.appendChild(intro);

    const pair = el("div", "profile-pair");
    pair.appendChild(el("span", "profile-chip", result.profiles.primary.label));
    pair.appendChild(el("span", "profile-chip", result.profiles.secondary.label));
    root.appendChild(pair);

    const gap = el("div", "gap-hero");
    gap.appendChild(el("div", "gap-number", String(result.gap.value)));
    const gapCopy = el("div", "gap-copy");
    gapCopy.appendChild(el("strong", null, result.gap.label));
    gapCopy.appendChild(el("p", null, "Story Potential " + result.storyPotential + "/100 → Digital Translation " + result.digitalTranslation + "/100. The difference is the Storytelling Gap: how much of the real business is being lost before a stranger arrives."));
    gap.appendChild(gapCopy);
    root.appendChild(gap);

    const grid = el("div", "score-grid");
    grid.appendChild(scoreCard("Identity", result.scores.identity));
    grid.appendChild(scoreCard("Story available", result.scores.storyAvailable));
    grid.appendChild(scoreCard("Story visible online", result.scores.storyVisible));
    grid.appendChild(scoreCard("Digital personality", result.scores.personalityDigital));
    grid.appendChild(scoreCard("Trust / social proof", result.scores.trust));
    root.appendChild(grid);

    const strongest = el("section", "result-section");
    strongest.appendChild(el("h3", null, "The story we would investigate first"));
    strongest.appendChild(el("p", null, result.strongestStory));
    root.appendChild(strongest);

    const digital = el("section", "result-section");
    digital.appendChild(el("h3", null, "What the digital version is saying"));
    digital.appendChild(el("p", null, result.digitalMessage));
    root.appendChild(digital);

    const opportunities = el("section", "result-section");
    opportunities.appendChild(el("h3", null, "Three places to look next"));
    opportunities.appendChild(el("p", null, "Not a generic content checklist — these are the first places where your answers suggest the real business may be getting lost in translation."));
    const list = el("div", "opportunity-list");
    result.opportunities.forEach(function (item) {
      const row = el("div", "opportunity-item");
      row.appendChild(el("strong", null, item.title));
      row.appendChild(el("span", null, item.detail));
      list.appendChild(row);
    });
    opportunities.appendChild(list);
    root.appendChild(opportunities);

    root.appendChild(el("p", "result-disclaimer", "This MVP is a self-reported Story Check. It has not inspected your website, Google profile, social accounts or booking pages yet. The stronger version compares what you told us with what a first-time visitor can actually see publicly — that is the Storytelling Gap we would trust for a real recommendation."));

    const actions = el("div", "result-actions");
    const email = el("a", "btn btn-primary", "Ask Historia Nomade to verify it");
    email.href = "mailto:hello@historianomade.com?subject=" + encodeURIComponent("Story Check — follow-up") + "&body=" + encodeURIComponent("Hi Historia Nomade,\n\nI completed the Story Check and would like you to compare it with my real public presence.\n\n" + result.summary);
    actions.appendChild(email);
    const again = el("button", "btn btn-ghost", "Start again");
    again.type = "button";
    again.addEventListener("click", function () {
      Object.keys(answers).forEach(function (key) { delete answers[key]; });
      history.length = 0;
      stepId = "businessType";
      render();
    });
    actions.appendChild(again);
    root.appendChild(actions);
  }

  function render() {
    if (stepId === "checkpoint") return renderCheckpoint();
    if (stepId === "result") return renderResult();
    return renderQuestion(QUESTIONS[stepId]);
  }

  render();
})();
