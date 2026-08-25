(function () {
  "use strict";

  const root = document.getElementById("story-check-root");
  const intro = document.getElementById("story-check-intro");
  const start = document.getElementById("story-check-start");
  const nameInput = document.getElementById("business-name");
  if (!root || !intro || !start || !window.StoryCheckEngine) return;

  const answers = { businessName: "" };
  let currentId = "businessType";

  const DETAIL_PROMPTS = {
    person: {
      label: "Who is that person, and what part of this place exists because of them?",
      hint: "One or two sentences is enough. Think of a decision, habit, value or detail that would not exist without them.",
      placeholder: "For example: My grandmother started serving breakfast this way, and we still...",
    },
    place: {
      label: "What would this business lose if it moved somewhere else?",
      hint: "Think beyond the address: a building, view, street, local rhythm, history or relationship with the region.",
      placeholder: "For example: The old courtyard is where neighbours used to...",
    },
    craft: {
      label: "What do you do behind the scenes that most guests never notice?",
      hint: "A process, recipe, preparation, sourcing choice or way of working that changes the experience.",
      placeholder: "For example: We prepare every... ourselves because...",
    },
    community: {
      label: "Which relationship, regular guest or local ritual says the most about this place?",
      hint: "Tell us about one real example rather than describing the community in general.",
      placeholder: "For example: Every Friday, the same group...",
    },
    idea: {
      label: "What did you want to do differently from the usual version of this kind of business?",
      hint: "Think about the thing you refused to copy, compromise on or do the standard way.",
      placeholder: "For example: We were tired of places that... so we decided to...",
    },
    memory: {
      label: "What happened here that still gets told?",
      hint: "A moment, person, turning point or small story that still carries meaning inside the business.",
      placeholder: "For example: In our first year... and people still remember it because...",
    },
  };

  const QUESTIONS = [
    {
      id: "businessType",
      stage: "Meet the business",
      label: "First — what kind of place are we talking about?",
      hint: "Choose the closest fit. We care more about the story than the category label.",
      type: "single",
      options: [
        ["hostel", "A hostel"],
        ["guesthouse", "A guesthouse or B&B"],
        ["hotel", "A boutique hotel"],
        ["restaurant", "A restaurant or café"],
        ["tours", "Tours or experiences"],
        ["other", "Something else in travel or hospitality"],
      ],
    },
    {
      id: "age",
      stage: "Meet the business",
      label: "How long has this story been unfolding?",
      type: "single",
      options: [
        ["new", "We are still in the first 2 years"],
        ["2-5", "2–5 years"],
        ["6-10", "6–10 years"],
        ["10+", "More than 10 years — there is some history here"],
      ],
    },
    {
      id: "origin",
      stage: "Where it came from",
      label: "How did it begin, really?",
      hint: "Not the polished About-page version. Which beginning feels closest to the truth?",
      type: "single",
      options: [
        ["family", "It grew from a family story, tradition or place we already had"],
        ["passion", "Someone cared about the idea enough to turn it into a business"],
        ["community", "This place, neighbourhood or community pulled the business into existence"],
        ["problem", "We thought the usual way was not good enough and wanted to do it differently"],
        ["opportunity", "An opportunity came first — the meaning grew around it later"],
        ["other", "It is harder to reduce to one reason"],
      ],
    },
    {
      id: "storyAnchor",
      stage: "Where the story lives",
      label: "If a curious guest stayed after closing and asked, “Why does this place matter to you?” — where would the story naturally go?",
      hint: "There is no marketing answer here. Choose the direction the conversation would genuinely take.",
      type: "single",
      options: [
        ["person", "To a person — the founder, family or someone who shaped it"],
        ["place", "To the place itself — the building, street, landscape or region"],
        ["craft", "To the way we make or do something"],
        ["community", "To the people around us and the relationships built here"],
        ["idea", "To an idea — what we wanted to change, prove or create"],
        ["memory", "To a memory — something that happened here and still matters"],
      ],
    },
    {
      id: "storyDetail",
      stage: "One real detail",
      type: "text",
      dynamicCopy: () => DETAIL_PROMPTS[answers.storyAnchor] || DETAIL_PROMPTS.idea,
      minLength: 12,
    },
    {
      id: "observedSignals",
      stage: "What people actually remember",
      label: "Think of comments you have genuinely heard more than once. What do guests tend to mention after the experience?",
      hint: "Pick up to three based on what people really say — not what you hope they say.",
      type: "multi",
      min: 1,
      max: 3,
      options: [
        ["welcome", "“The people made us feel at home / really looked after us.”"],
        ["craft", "“You notice the quality and the care in how things are done.”"],
        ["knowledge", "“They really know their area, craft or world.”"],
        ["atmosphere", "“There is a feeling here that is hard to explain.”"],
        ["place", "“The building, neighbourhood or location is part of what makes it special.”"],
        ["story", "“The story, family or people behind it stayed with us.”"],
        ["different", "“It does not feel like the other places in this category.”"],
        ["functional", "“It was mainly a good option for price, location or convenience.”"],
        ["none", "We do not hear a clear pattern yet"],
      ],
    },
    {
      id: "storyAssets",
      stage: "Stories already inside",
      label: "Which other stories are already sitting inside the business — even if you rarely tell them online?",
      hint: "Think of what someone could discover by spending an afternoon with you. Select all that genuinely exist.",
      type: "multi",
      min: 1,
      options: [
        ["founder", "How the founder or business began"],
        ["team", "People on the team with stories worth knowing"],
        ["process", "A distinctive process, craft, recipe or way of working"],
        ["local", "A meaningful relationship with the neighbourhood, region or community"],
        ["customers", "Regulars or returning guests with stories of their own"],
        ["archive", "Old photos, objects, milestones or pieces of history"],
        ["values", "Values that genuinely change business decisions"],
        ["none", "Honestly, there is not much more yet"],
      ],
    },
    {
      id: "storyBridge",
      stage: "Your story so far",
      type: "bridge",
    },
    {
      id: "channels",
      stage: "Now meet the digital version",
      label: "Now imagine someone hears your name for the first time. Where are they likely to meet you online?",
      hint: "Choose the places a stranger would realistically find or use today.",
      type: "multi",
      min: 1,
      options: [
        ["website", "Your own website"],
        ["instagram", "Instagram"],
        ["google", "Google Search or Maps"],
        ["ota", "Booking or travel platforms"],
        ["facebook", "Facebook"],
        ["tiktok", "TikTok"],
        ["whatsapp", "WhatsApp or direct messaging"],
        ["none", "Almost nowhere — most people find us offline or by referral"],
      ],
    },
    {
      id: "digitalShows",
      stage: "What a stranger sees",
      label: "Give that stranger sixty seconds. What would they learn most clearly?",
      hint: "Choose what is actually easiest to understand from the public presence today.",
      type: "single",
      when: () => !selected("channels", "none"),
      options: [
        ["product", "What we sell — rooms, menu, tours, prices or promotions"],
        ["place", "What the place looks and feels like"],
        ["people", "Who the people behind it are"],
        ["story", "Where the business came from and what it stands for"],
        ["experience", "What guests or customers actually experience"],
        ["inconsistent", "Mostly fragments — old, mixed or inconsistent information"],
      ],
    },
    {
      id: "visibleAssets",
      stage: "What a stranger sees",
      label: "Earlier you told us what stories exist inside the business. Which of those can a stranger actually find online today?",
      hint: "Only count something if a first-time visitor could reasonably discover it without already knowing the story.",
      type: "multi",
      min: 1,
      when: () => !selected("channels", "none") && !selected("storyAssets", "none"),
      dynamicOptions: () => {
        const names = {
          founder: "The founder or origin story",
          team: "The people behind the business",
          process: "The process, craft or way you work",
          local: "The relationship with the local place or community",
          customers: "Stories from regulars or returning guests",
          archive: "Old photos, milestones or historical material",
          values: "The choices and values behind the business",
        };
        const options = (answers.storyAssets || []).filter((x) => x !== "none").map((x) => [x, names[x]]);
        options.push(["none", "Almost none of those stories are easy to find online"]);
        return options;
      },
    },
    {
      id: "digitalMatch",
      stage: "Does the feeling survive?",
      label: "When you look at your own pages, do they feel like the same place people experience in real life?",
      hint: "Think about tone, photos, people, expectations and overall feeling — not just whether the information is correct.",
      type: "scale",
      when: () => !selected("channels", "none"),
      low: "Barely feels like us",
      high: "Feels very true to us",
    },
    {
      id: "clarity",
      stage: "Does the difference survive?",
      label: "Without already knowing you, would a stranger understand why someone chooses this place instead of another nearby?",
      type: "scale",
      when: () => !selected("channels", "none"),
      low: "Probably not",
      high: "Very clearly",
    },
    {
      id: "reviews",
      stage: "Can they believe it?",
      label: "How easy is it for that stranger to find proof from real guests that matches the story you just described?",
      hint: "Think recent reviews, testimonials, repeat guests and other visible signs of trust.",
      type: "single",
      when: () => !selected("channels", "none"),
      options: [
        ["strong", "Easy — recent, credible proof is hard to miss"],
        ["some", "There is proof, but someone has to look for it"],
        ["weak", "Very little public proof is visible"],
        ["unknown", "I am genuinely not sure"],
      ],
    },
  ];

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function selected(id, value) {
    const answer = answers[id];
    return Array.isArray(answer) ? answer.includes(value) : answer === value;
  }

  function activeQuestions() {
    return QUESTIONS.filter((q) => !q.when || q.when());
  }

  function clear() {
    while (root.firstChild) root.removeChild(root.firstChild);
  }

  function sanitiseDependencies() {
    if (selected("channels", "none")) {
      answers.digitalShows = "none";
      answers.visibleAssets = ["none"];
      answers.digitalMatch = "1";
      answers.clarity = "1";
      answers.reviews = "unknown";
    }
  }

  function questionCopy(question) {
    if (!question.dynamicCopy) return question;
    return Object.assign({}, question, question.dynamicCopy());
  }

  function progress(question) {
    const list = activeQuestions();
    const i = list.findIndex((q) => q.id === question.id);
    const box = el("div", "sc-progress");
    const track = el("div", "sc-progress-track");
    list.forEach((q, index) => {
      if (q.type === "bridge") return;
      const mark = el("span", "sc-progress-mark");
      if (index < i) mark.classList.add("done");
      if (index === i) mark.classList.add("current");
      track.appendChild(mark);
    });
    box.appendChild(track);
    if (question.type !== "bridge") {
      const visible = list.filter((q) => q.type !== "bridge");
      const current = visible.findIndex((q) => q.id === question.id) + 1;
      box.appendChild(el("span", "sc-progress-count", `${current} / ${visible.length}`));
    }
    root.appendChild(box);
  }

  function heading(question) {
    const copy = questionCopy(question);
    const head = el("div", "sc-question-head");
    head.appendChild(el("p", "eyebrow", copy.stage));
    head.appendChild(el("h2", "sc-question", copy.label));
    if (copy.hint) head.appendChild(el("p", "sc-hint", copy.hint));
    root.appendChild(head);
  }

  function toggleMulti(question, value) {
    let current = Array.isArray(answers[question.id]) ? answers[question.id].slice() : [];
    if (value === "none") {
      answers[question.id] = current.includes("none") ? [] : ["none"];
      return;
    }
    current = current.filter((x) => x !== "none");
    if (current.includes(value)) current = current.filter((x) => x !== value);
    else if (!question.max || current.length < question.max) current.push(value);
    answers[question.id] = current;
  }

  function options(question) {
    const box = el("div", "sc-options");
    const items = question.dynamicOptions ? question.dynamicOptions() : question.options;
    items.forEach(([value, label]) => {
      const button = el("button", "sc-option");
      button.type = "button";
      button.setAttribute("aria-pressed", String(selected(question.id, value)));
      button.appendChild(el("span", "sc-option-text", label));
      button.addEventListener("click", () => {
        if (question.type === "multi") {
          toggleMulti(question, value);
          render();
        } else {
          answers[question.id] = value;
          move(1);
        }
      });
      box.appendChild(button);
    });
    root.appendChild(box);
  }

  function scale(question) {
    const box = el("div", "sc-scale");
    const labels = el("div", "sc-scale-labels");
    labels.appendChild(el("span", null, question.low));
    labels.appendChild(el("span", null, question.high));
    box.appendChild(labels);
    const buttons = el("div", "sc-scale-buttons");
    for (let n = 1; n <= 5; n += 1) {
      const button = el("button", "sc-scale-button", String(n));
      button.type = "button";
      button.setAttribute("aria-label", `${n} out of 5`);
      button.setAttribute("aria-pressed", String(answers[question.id] === String(n)));
      button.addEventListener("click", () => {
        answers[question.id] = String(n);
        move(1);
      });
      buttons.appendChild(button);
    }
    box.appendChild(buttons);
    root.appendChild(box);
  }

  function textAnswer(question) {
    const copy = questionCopy(question);
    const box = el("div", "sc-text-answer");
    const textarea = document.createElement("textarea");
    textarea.id = `answer-${question.id}`;
    textarea.rows = 5;
    textarea.maxLength = 420;
    textarea.placeholder = copy.placeholder || "Tell us in your own words...";
    textarea.value = answers[question.id] || "";
    textarea.setAttribute("aria-label", copy.label);
    const counter = el("p", "sc-text-note");
    const update = () => {
      answers[question.id] = textarea.value.trim();
      const remaining = Math.max(0, (question.minLength || 1) - answers[question.id].length);
      counter.textContent = remaining ? `${remaining} more character${remaining === 1 ? "" : "s"} to continue.` : "That is enough — keep it as simple or specific as you like.";
      const next = root.querySelector(".sc-actions .btn-primary");
      if (next) next.disabled = answers[question.id].length < (question.minLength || 1);
    };
    textarea.addEventListener("input", update);
    box.appendChild(textarea);
    box.appendChild(counter);
    root.appendChild(box);
    update();
    textarea.focus({ preventScroll: true });
  }

  function ready(question) {
    if (question.type === "multi") {
      const value = Array.isArray(answers[question.id]) ? answers[question.id] : [];
      if (value.includes("none")) return true;
      return value.length >= (question.min || 1);
    }
    if (question.type === "text") return String(answers[question.id] || "").trim().length >= (question.minLength || 1);
    return true;
  }

  function actions(question, forceNextLabel) {
    const box = el("div", "sc-actions");
    const list = activeQuestions();
    const i = list.findIndex((q) => q.id === question.id);
    if (i > 0) {
      const back = el("button", "btn btn-ghost", "Back");
      back.type = "button";
      back.addEventListener("click", () => move(-1));
      box.appendChild(back);
    }
    box.appendChild(el("span", "sc-actions-spacer"));
    if (["multi", "text", "bridge"].includes(question.type)) {
      const next = el("button", "btn btn-primary", forceNextLabel || "Continue");
      next.type = "button";
      next.disabled = question.type !== "bridge" && !ready(question);
      next.addEventListener("click", () => move(1));
      box.appendChild(next);
    }
    root.appendChild(box);
  }

  function bridge(question) {
    const preview = window.StoryCheckEngine.buildStoryPreview(answers);
    const head = el("div", "sc-bridge-head");
    head.appendChild(el("p", "eyebrow", "Before we look at the internet"));
    head.appendChild(el("h2", null, "We have met the real business first."));
    head.appendChild(el("p", "lead", "That matters. Otherwise we would be judging a website without knowing what it is supposed to carry."));
    root.appendChild(head);

    const thread = el("div", "sc-story-note");
    thread.appendChild(el("span", "sc-card-kicker", "The thread in your own story"));
    thread.appendChild(el("p", null, preview.narrativeThread));
    root.appendChild(thread);

    const grid = el("div", "sc-preview-grid");
    [preview.profiles.primary, preview.profiles.secondary].forEach((profile, i) => {
      const card = el("article", "sc-preview-card");
      card.appendChild(el("span", "sc-card-kicker", i === 0 ? "Strongest character signal" : "Supporting signal"));
      card.appendChild(el("h3", null, profile.label));
      card.appendChild(el("p", null, profile.description));
      grid.appendChild(card);
    });
    root.appendChild(grid);

    const story = el("div", "sc-story-note");
    story.appendChild(el("span", "sc-card-kicker", "The larger story we would pull on first"));
    story.appendChild(el("p", null, preview.strongestStory));
    root.appendChild(story);

    root.appendChild(el("p", "sc-transition", "Now we can ask the useful question: when a stranger meets this business through a screen, how much of that story and character makes it across?"));
    actions(question, "Meet the digital version");
  }

  function move(delta) {
    sanitiseDependencies();
    const list = activeQuestions();
    const i = list.findIndex((q) => q.id === currentId);
    const next = list[i + delta];
    if (next) {
      currentId = next.id;
      render();
    } else if (delta > 0) {
      result();
    }
  }

  function render() {
    intro.hidden = true;
    root.hidden = false;
    clear();
    sanitiseDependencies();
    const list = activeQuestions();
    let question = list.find((q) => q.id === currentId);
    if (!question) {
      question = list[0];
      currentId = question.id;
    }
    progress(question);
    if (question.type === "bridge") bridge(question);
    else {
      heading(question);
      if (question.type === "scale") scale(question);
      else if (question.type === "text") textAnswer(question);
      else options(question);
      actions(question);
    }
    root.focus({ preventScroll: true });
  }

  function scoreCard(label, value, note) {
    const card = el("article", "sc-score-card");
    const row = el("div", "sc-score-row");
    row.appendChild(el("strong", null, label));
    row.appendChild(el("span", "sc-score-value", `${value}/100`));
    card.appendChild(row);
    const meter = document.createElement("progress");
    meter.max = 100;
    meter.value = value;
    meter.setAttribute("aria-label", `${label}: ${value} out of 100`);
    card.appendChild(meter);
    card.appendChild(el("p", null, note));
    return card;
  }

  function result() {
    const report = window.StoryCheckEngine.buildDiagnosis(answers);
    clear();

    const hero = el("section", "sc-result-hero");
    hero.appendChild(el("p", "eyebrow", "Your Historia Nomade Story Check"));
    hero.appendChild(el("h1", null, answers.businessName ? `The story of ${answers.businessName}` : "How much of your real story survives online?"));
    hero.appendChild(el("p", "sc-result-lead", report.gapMessage));
    const comparison = el("div", "sc-comparison");
    const potential = el("div", "sc-comparison-side");
    potential.appendChild(el("span", null, "Story potential"));
    potential.appendChild(el("strong", null, String(report.storyPotential)));
    comparison.appendChild(potential);
    comparison.appendChild(el("span", "sc-comparison-arrow", "→"));
    const digital = el("div", "sc-comparison-side");
    digital.appendChild(el("span", null, "Digital translation"));
    digital.appendChild(el("strong", null, String(report.digitalTranslation)));
    comparison.appendChild(digital);
    hero.appendChild(comparison);
    const gap = el("div", `sc-gap sc-gap-${report.gap.id}`);
    gap.appendChild(el("span", "sc-gap-label", "Storytelling Gap"));
    gap.appendChild(el("strong", "sc-gap-number", String(report.gap.value)));
    gap.appendChild(el("span", "sc-gap-unit", "points"));
    gap.appendChild(el("span", "sc-gap-level", report.gap.label));
    hero.appendChild(gap);
    root.appendChild(hero);

    const profile = el("section", "sc-result-section");
    profile.appendChild(el("span", "section-index", "01 — The business we met"));
    const thread = el("div", "sc-story-note");
    thread.appendChild(el("span", "sc-card-kicker", "The story in your own words"));
    thread.appendChild(el("p", null, report.narrativeThread));
    profile.appendChild(thread);
    const profileGrid = el("div", "sc-profile-grid");
    [report.profiles.primary, report.profiles.secondary].forEach((p, i) => {
      const card = el("article", "sc-profile-card");
      card.appendChild(el("span", "sc-card-kicker", i === 0 ? "Primary character" : "Secondary character"));
      card.appendChild(el("h2", null, p.label));
      card.appendChild(el("p", null, p.description));
      profileGrid.appendChild(card);
    });
    profile.appendChild(profileGrid);
    root.appendChild(profile);

    const findings = el("section", "sc-result-section");
    findings.appendChild(el("span", "section-index", "02 — What is making the journey online"));
    const findingGrid = el("div", "sc-finding-grid");
    const real = el("article", "sc-finding-card");
    real.appendChild(el("h3", null, "Strongest story signal"));
    real.appendChild(el("p", null, report.strongestStory));
    findingGrid.appendChild(real);
    const online = el("article", "sc-finding-card");
    online.appendChild(el("h3", null, "What a stranger is meeting"));
    online.appendChild(el("p", null, report.digitalMessage));
    findingGrid.appendChild(online);
    findings.appendChild(findingGrid);
    root.appendChild(findings);

    const signals = el("section", "sc-result-section");
    signals.appendChild(el("span", "section-index", "03 — Diagnostic signals"));
    const scores = el("div", "sc-score-grid");
    scores.appendChild(scoreCard("Identity", report.scores.identity, "How much distinctive human material the answers reveal about this specific business."));
    scores.appendChild(scoreCard("Story available", report.scores.storyAvailable, "How much genuine narrative material seems to exist before any marketing is invented."));
    scores.appendChild(scoreCard("Story visible online", report.scores.storyVisible, "How much of that real material a first-time visitor appears able to discover digitally."));
    scores.appendChild(scoreCard("Digital personality", report.scores.personalityDigital, "How closely the digital version seems to feel like the real experience."));
    scores.appendChild(scoreCard("Trust / social proof", report.scores.trust, "How easily a stranger can find credible evidence that real guests support the promise."));
    signals.appendChild(scores);
    root.appendChild(signals);

    const next = el("section", "sc-result-section");
    next.appendChild(el("span", "section-index", "04 — Where we would look next"));
    const list = el("div", "sc-opportunities");
    report.opportunities.forEach((op, i) => {
      const item = el("article", "sc-opportunity");
      item.appendChild(el("span", "sc-opportunity-number", String(i + 1).padStart(2, "0")));
      const copy = el("div");
      copy.appendChild(el("h3", null, op.title));
      copy.appendChild(el("p", null, op.detail));
      item.appendChild(copy);
      list.appendChild(item);
    });
    next.appendChild(list);
    root.appendChild(next);

    const caveat = el("section", "sc-caveat");
    caveat.appendChild(el("p", "eyebrow", "One important thing"));
    caveat.appendChild(el("h2", null, "This is the hypothesis. The internet is the evidence."));
    caveat.appendChild(el("p", null, "Your answers tell us how you understand the business. The next layer is to open the real website, maps, social profiles and booking channels as a stranger would, then compare what is actually there with the story above."));
    caveat.appendChild(el("p", null, "That is the version of the Storytelling Gap we would trust for a real recommendation."));
    const actionRow = el("div", "sc-result-actions");
    const email = el("a", "btn btn-primary", "Ask us to verify the public story");
    email.href = `mailto:hello@historianomade.com?subject=${encodeURIComponent(`Story Check — ${answers.businessName || "my business"}`)}&body=${encodeURIComponent(`${report.summary}\n\nI would like Historia Nomade to compare this with what a stranger actually sees online.`)}`;
    actionRow.appendChild(email);
    const restart = el("button", "btn btn-ghost", "Start again");
    restart.type = "button";
    restart.addEventListener("click", () => {
      Object.keys(answers).forEach((key) => delete answers[key]);
      answers.businessName = nameInput ? nameInput.value.trim() : "";
      currentId = "businessType";
      render();
    });
    actionRow.appendChild(restart);
    caveat.appendChild(actionRow);
    caveat.appendChild(el("p", "sc-privacy", "Nothing is sent when you finish this check. The email button only opens a message for you to review and send yourself."));
    root.appendChild(caveat);
    root.focus({ preventScroll: true });
  }

  start.addEventListener("click", () => {
    answers.businessName = nameInput ? nameInput.value.trim() : "";
    currentId = "businessType";
    render();
  });

  if (nameInput) {
    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        start.click();
      }
    });
  }
})();