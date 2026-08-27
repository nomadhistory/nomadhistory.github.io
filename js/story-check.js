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
      label: "What relationship, tradition or local connection says something important about this place?",
      hint: "Tell us about one real example rather than describing the community in general.",
      placeholder: "For example: Every Friday, the same group...",
    },
    idea: {
      label: "What did you want to do differently from the usual way?",
      hint: "Think about the thing you refused to copy, compromise on or do the standard way.",
      placeholder: "For example: We were tired of places that... so we decided to...",
    },
    memory: {
      label: "What happened here that people still remember or talk about?",
      hint: "A moment, person, turning point or small story that still carries meaning inside the business.",
      placeholder: "For example: In our first year... and people still remember it because...",
    },
  };

  const SIGNAL_LABELS = {
    welcome: "the people and the way guests are looked after",
    craft: "the quality and care in how things are done",
    knowledge: "the knowledge and confidence behind the experience",
    atmosphere: "the atmosphere and feeling of the place",
    place: "the building, neighbourhood or location itself",
    story: "the people and story behind the business",
    different: "the fact that it does not feel like the usual version of this category",
    functional: "price, location or convenience",
  };

  const ASSET_LABELS = {
    founder: "the founder or origin story",
    team: "the people behind the business",
    process: "the process, craft or way you work",
    local: "the relationship with the local place or community",
    customers: "stories from regulars or returning guests",
    archive: "old photos, milestones or historical material",
    values: "the choices and values behind the business",
  };

  const PAIN_TEXT = {
    generic: "the digital version feels more generic than the real business",
    photos: "the photos do not do the place justice",
    confusion: "people still arrive without understanding things they should already know",
    dependence: "the business depends too much on platforms or third-party channels",
    attention: "there is attention, but too little of it turns into a direct next step",
    outdated: "the online presence feels old or inconsistent",
    unsure: "the digital problem is not fully clear from inside the business yet",
  };

  const GOAL_LABELS = {
    direct: "more direct bookings or sales",
    aligned: "attracting people who are a better fit",
    value: "increasing perceived value",
    platforms: "depending less on Booking, OTAs or other platforms",
    lowseason: "making the low season work better",
    launch: "giving visibility to something new",
    professional: "making the digital presence more professional and consistent",
    unknown: "figuring out what actually needs to change first",
  };

  const QUESTIONS = [
    {
      id: "businessType",
      stage: "Meet the business",
      label: "First — what kind of place are we getting to know?",
      hint: "Choose the closest fit. The category gives us context, not the conclusion.",
      type: "single",
      options: [
        ["hotel", "Hotel / boutique hotel"],
        ["guesthouse", "Guesthouse / B&B"],
        ["hostel", "Hostel"],
        ["restaurant", "Restaurant / café"],
        ["tours", "Tours / experiences"],
        ["other", "Something else in travel or hospitality"],
      ],
    },
    {
      id: "age",
      stage: "Meet the business",
      label: "How long has this story been unfolding?",
      type: "single",
      options: [
        ["new", "Less than 2 years"],
        ["2-5", "2–5 years"],
        ["6-10", "6–10 years"],
        ["10+", "More than 10 years"],
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
        ["passion", "Someone really wanted to create it"],
        ["community", "It grew from a relationship with the place or community"],
        ["problem", "We wanted to do something differently from the usual way"],
        ["opportunity", "An opportunity came first and meaning grew around it later"],
        ["other", "It is more complicated than one of these"],
      ],
    },
    {
      id: "storyAnchor",
      stage: "Where the story lives",
      label: "When you explain why this place matters, where does the story naturally go?",
      hint: "Choose the direction the conversation would genuinely take.",
      type: "single",
      options: [
        ["person", "A person"],
        ["place", "The place itself"],
        ["craft", "The way something is made or done"],
        ["community", "The community or relationships around it"],
        ["idea", "An idea or point of view"],
        ["memory", "A memory or story that happened here"],
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
      stage: "What people actually value",
      label: "Think about the compliments you hear again and again. What do people actually mention?",
      hint: "Pick up to three based on what people really say — not what you hope they say.",
      type: "multi",
      min: 1,
      max: 3,
      options: [
        ["welcome", "People / service / being looked after"],
        ["atmosphere", "Atmosphere and feeling"],
        ["craft", "Quality or care in how things are done"],
        ["knowledge", "Knowledge / confidence"],
        ["story", "The personality or story of the place"],
        ["place", "The building, neighbourhood or location"],
        ["different", "It feels meaningfully different from similar places"],
        ["functional", "Location, price or convenience"],
        ["none", "We do not hear a clear pattern yet"],
      ],
    },
    {
      id: "afterVisit",
      stage: "What arrives too late",
      label: "What do people usually only understand after they have already been here?",
      hint: "Think of something the real experience makes obvious, but a stranger may not understand before choosing you.",
      type: "text",
      minLength: 12,
      placeholder: "For example: They only realise how personal the experience is once they meet the team...",
    },
    {
      id: "storyAssets",
      stage: "Stories already inside",
      label: "Which of these stories already exist inside the business — even if you rarely show them?",
      hint: "Select all that genuinely exist.",
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
      stage: "What we understood",
      type: "bridge",
    },
    {
      id: "sixMonths",
      stage: "What matters now",
      label: "If the next six months went well, what would be different?",
      hint: "Choose up to two. This helps us prioritise the diagnosis around a real business need.",
      type: "multi",
      min: 1,
      max: 2,
      options: [
        ["direct", "More direct bookings / sales"],
        ["aligned", "Attract people who are a better fit"],
        ["value", "Increase perceived value / charge better"],
        ["platforms", "Depend less on Booking, OTAs or platforms"],
        ["lowseason", "Improve the low season"],
        ["launch", "Give visibility to something new"],
        ["professional", "Have a more professional and consistent digital presence"],
        ["unknown", "We are not sure yet"],
      ],
    },
    {
      id: "digitalPain",
      stage: "What already feels wrong",
      label: "When people find you online, what feels most wrong or frustrating?",
      type: "single",
      options: [
        ["generic", "It looks more generic than the real business"],
        ["photos", "The photos do not do the place justice"],
        ["confusion", "People arrive without understanding things they should already know"],
        ["dependence", "We depend too much on Booking, Instagram, referrals or other platforms"],
        ["attention", "We get attention, but too little turns into bookings or enquiries"],
        ["outdated", "Everything feels a little old or inconsistent"],
        ["unsure", "I am not sure"],
      ],
    },
    {
      id: "channels",
      stage: "Now meet the digital version",
      label: "Where are people likely to meet you online today?",
      hint: "Choose the places a stranger would realistically find or use.",
      type: "multi",
      min: 1,
      options: [
        ["website", "Website"],
        ["google", "Google Search or Maps"],
        ["instagram", "Instagram"],
        ["ota", "Booking or travel platforms"],
        ["facebook", "Facebook"],
        ["tiktok", "TikTok"],
        ["whatsapp", "WhatsApp or direct messaging"],
        ["none", "Practically nowhere"],
      ],
    },
    {
      id: "digitalShows",
      stage: "The sixty-second test",
      label: "If a stranger gave you sixty seconds online, what would they understand most clearly?",
      hint: "Choose what is actually easiest to understand today.",
      type: "single",
      when: () => !selected("channels", "none"),
      options: [
        ["product", "What we sell — rooms, menu, tours, prices or promotions"],
        ["place", "How the place looks"],
        ["people", "Who the people behind it are"],
        ["story", "Our story"],
        ["experience", "What the experience feels like"],
        ["inconsistent", "Mostly fragmented or inconsistent information"],
      ],
    },
    {
      id: "visibleAssets",
      stage: "What is actually visible",
      label: "Earlier you told us which stories exist inside the business. Which of those can a stranger actually find online today?",
      hint: "Only count something if a first-time visitor could reasonably discover it without already knowing the story.",
      type: "multi",
      min: 1,
      when: () => !selected("channels", "none") && !selected("storyAssets", "none"),
      dynamicOptions: () => {
        const options = (answers.storyAssets || [])
          .filter((x) => x !== "none")
          .map((x) => [x, ASSET_LABELS[x]]);
        options.push(["none", "Almost none of those stories are easy to find online"]);
        return options;
      },
    },
    {
      id: "digitalMatch",
      stage: "Does the experience survive?",
      label: "When you look at your own pages, does it feel like the same place people experience in real life?",
      type: "scale",
      when: () => !selected("channels", "none"),
      low: "Barely feels like us",
      high: "Feels very true to us",
    },
    {
      id: "clarity",
      stage: "Is the reason to choose clear?",
      label: "Would a stranger understand why people choose you — not just what you sell?",
      type: "scale",
      when: () => !selected("channels", "none"),
      low: "Probably not",
      high: "Very clearly",
    },
    {
      id: "reviews",
      stage: "Can they believe it?",
      label: "If someone liked what they saw, how easy would it be for them to find proof from real guests or customers?",
      type: "single",
      when: () => !selected("channels", "none"),
      options: [
        ["strong", "Very easy"],
        ["some", "It exists, but someone has to look for it"],
        ["weak", "Very little is visible"],
        ["unknown", "I am not sure"],
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

  function clean(list) {
    return (Array.isArray(list) ? list : []).filter((x) => x && x !== "none");
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
    if (value === "none" || value === "unknown") {
      answers[question.id] = current.includes(value) ? [] : [value];
      return;
    }
    current = current.filter((x) => x !== "none" && x !== "unknown");
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
      if (value.includes("none") || value.includes("unknown")) return true;
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

  function storyUnderstanding() {
    const anchor = {
      person: "a person and the choices they left inside the business",
      place: "the place itself and what would disappear if the business moved",
      craft: "the way things are made or done behind the scenes",
      community: "relationships, traditions and local connections",
      idea: "a point of view about doing things differently",
      memory: "a memory or event that still gives the place meaning",
    }[answers.storyAnchor] || "the experience itself";
    const signals = clean(answers.observedSignals).map((x) => SIGNAL_LABELS[x]).filter(Boolean);
    const signalText = signals.length ? signals.slice(0, 2).join(" and ") : "the experience people have once they arrive";
    return `The strongest part of this story seems to live in ${anchor}. Guests appear to remember ${signalText}. One important part of the value only becomes clear after the experience: “${answers.afterVisit || "something the digital presence is not explaining early enough"}”`;
  }

  function bridge(question) {
    const head = el("div", "sc-bridge-head");
    head.appendChild(el("p", "eyebrow", "Before we look at the internet"));
    head.appendChild(el("h2", null, "There is already something clear here."));
    head.appendChild(el("p", "lead", storyUnderstanding()));
    root.appendChild(head);

    const note = el("div", "sc-story-note");
    note.appendChild(el("span", "sc-card-kicker", "One detail worth holding onto"));
    note.appendChild(el("p", null, answers.storyDetail));
    root.appendChild(note);

    root.appendChild(el("p", "sc-transition", "Now we want to understand what the business needs next — and whether a stranger can see enough of this before choosing you."));
    actions(question, "Continue");
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

  function missingAssets() {
    const available = clean(answers.storyAssets);
    const visible = clean(answers.visibleAssets);
    return available.filter((x) => !visible.includes(x));
  }

  function strongestContradiction() {
    if (selected("channels", "none")) {
      return "The main gap is simple: the business has a real experience and story, but a stranger has almost no digital version of it to meet before choosing you.";
    }

    const missing = missingAssets();
    const signalToAsset = {
      welcome: "team",
      craft: "process",
      knowledge: "process",
      place: "local",
      story: "founder",
      different: "values",
    };
    const signals = clean(answers.observedSignals);
    const matched = signals.map((x) => signalToAsset[x]).find((x) => x && missing.includes(x));
    const asset = matched || missing[0];
    const signal = signals[0] ? SIGNAL_LABELS[signals[0]] : "the real experience";

    if (asset) {
      return `Based on your answers, people seem to value ${signal}, but ${ASSET_LABELS[asset]} is still difficult for a stranger to find online. The business is richer than the version people meet before arrival.`;
    }

    const match = Number(answers.digitalMatch || 1);
    const clarity = Number(answers.clarity || 1);
    if (match <= 2) return "The clearest tension is not missing information — it is that the digital presence does not feel like the same business people experience in real life.";
    if (clarity <= 2) return "The business may be represented online, but the reason people choose it is still much less clear than the offer itself.";
    return "The core story is making part of the journey online. The remaining opportunity is to make the strongest reasons to care more consistent and easier to find before someone decides.";
  }

  function digitalReading(report) {
    if (selected("channels", "none")) return "A stranger has almost no digital version of the business to meet yet.";
    const pain = PAIN_TEXT[answers.digitalPain];
    const base = report.digitalMessage || "A stranger can find the business, but not necessarily the same experience guests describe afterwards.";
    return pain ? `${base} You also told us that ${pain}.` : base;
  }

  function addPriority(list, title, detail) {
    if (!list.some((item) => item.title === title)) list.push({ title, detail });
  }

  function priorities(report) {
    const out = [];
    const goals = clean(answers.sixMonths);
    const missing = missingAssets();

    if (answers.digitalPain === "photos") {
      addPriority(out, "Rebuild the visual first impression", "Show the people, atmosphere and details that make the real experience feel different before adding more volume of content.");
    }
    if (answers.digitalPain === "generic") {
      addPriority(out, "Make the first impression unmistakably yours", "Move one or two real story signals into the places a stranger sees first instead of relying on generic category language.");
    }
    if (answers.digitalPain === "confusion") {
      addPriority(out, "Fix what people should understand before arrival", "Turn the questions and surprises guests repeatedly have into clearer information and story before they contact or book.");
    }
    if (answers.digitalPain === "dependence" || goals.includes("platforms")) {
      addPriority(out, "Strengthen the path you own", "Give people a clear place to understand the business and take a direct next step without forcing the whole relationship through a third-party platform.");
    }
    if (answers.digitalPain === "attention" || goals.includes("direct")) {
      addPriority(out, "Connect interest to one clear next step", "Make the reason to choose you and the path to enquire, book or buy feel like the same journey instead of two separate tasks.");
    }
    if (answers.digitalPain === "outdated" || goals.includes("professional")) {
      addPriority(out, "Create one consistent version of the business", "Align the most important pages and channels around the same current message, visuals and next step before expanding into more channels.");
    }
    if (goals.includes("aligned") || goals.includes("value")) {
      addPriority(out, "Make the reason people care more visible", "Use the strongest real story signal to attract people who value the experience, not only people comparing features or price.");
    }
    if (goals.includes("lowseason") || goals.includes("launch")) {
      addPriority(out, "Build one specific story around the current need", "Instead of generic posting, create a focused piece of content or campaign around the season, experience or offer you actually need people to notice now.");
    }

    const missingPriority = missing.find((x) => ASSET_LABELS[x]);
    if (missingPriority) {
      addPriority(out, "Bring a real story signal into the public journey", `Start with ${ASSET_LABELS[missingPriority]} — it already exists inside the business, but it is not doing enough work online.`);
    }

    if (answers.reviews === "weak") {
      addPriority(out, "Make proof easier to find", "Bring recent, credible guest proof closer to the moment a stranger is deciding whether to believe the promise.");
    }

    (report.opportunities || []).forEach((item) => addPriority(out, item.title, item.detail));
    return out.slice(0, 3);
  }

  function notFirst() {
    if (answers.digitalPain === "photos") return "I would not start by adding more copy. The first mismatch sounds visual.";
    if (answers.digitalPain === "dependence" || clean(answers.sixMonths).includes("direct")) return "I would not start with more paid traffic. First make the owned path worth sending people to.";
    if (answers.digitalShows === "inconsistent") return "I would not add more channels yet. First make the existing ones agree about who you are.";
    if (clean(answers.storyAssets).length >= 3) return "I would not start by posting more often. You already appear to have enough material; the first job is deciding what deserves to be visible.";
    return "I would not start by inventing a new brand story. The useful material should come from what already happens in the business.";
  }

  function result() {
    const report = window.StoryCheckEngine.buildDiagnosis(answers);
    clear();

    const hero = el("section", "sc-result-hero");
    hero.appendChild(el("p", "eyebrow", "Your Historia Nomade Story Check"));
    hero.appendChild(el("h1", null, answers.businessName ? `What we understood about ${answers.businessName}` : "What seems to be getting lost online"));
    hero.appendChild(el("p", "sc-result-lead", strongestContradiction()));
    root.appendChild(hero);

    const understood = el("section", "sc-result-section");
    understood.appendChild(el("span", "section-index", "01 — What we understood about you"));
    const story = el("div", "sc-story-note");
    story.appendChild(el("p", null, storyUnderstanding()));
    understood.appendChild(story);
    const detail = el("div", "sc-finding-grid");
    const detailCard = el("article", "sc-finding-card");
    detailCard.appendChild(el("h3", null, "A real detail worth keeping"));
    detailCard.appendChild(el("p", null, answers.storyDetail));
    detail.appendChild(detailCard);
    const goalCard = el("article", "sc-finding-card");
    goalCard.appendChild(el("h3", null, "What matters in the next six months"));
    const goals = clean(answers.sixMonths).map((x) => GOAL_LABELS[x]).filter(Boolean);
    goalCard.appendChild(el("p", null, goals.length ? goals.join("; ") : "You are still working out what should change first."));
    detail.appendChild(goalCard);
    understood.appendChild(detail);
    root.appendChild(understood);

    const online = el("section", "sc-result-section");
    online.appendChild(el("span", "section-index", "02 — What a stranger probably meets online"));
    const onlineNote = el("div", "sc-story-note");
    onlineNote.appendChild(el("p", null, digitalReading(report)));
    online.appendChild(onlineNote);
    root.appendChild(online);

    const lost = el("section", "sc-result-section");
    lost.appendChild(el("span", "section-index", "03 — What is getting lost"));
    const lostGrid = el("div", "sc-finding-grid");
    const contradiction = el("article", "sc-finding-card");
    contradiction.appendChild(el("h3", null, "The main contradiction"));
    contradiction.appendChild(el("p", null, strongestContradiction()));
    lostGrid.appendChild(contradiction);
    const late = el("article", "sc-finding-card");
    late.appendChild(el("h3", null, "What people understand too late"));
    late.appendChild(el("p", null, answers.afterVisit));
    lostGrid.appendChild(late);
    lost.appendChild(lostGrid);
    root.appendChild(lost);

    const next = el("section", "sc-result-section");
    next.appendChild(el("span", "section-index", "04 — What I would do first"));
    const notNow = el("div", "sc-story-note");
    notNow.appendChild(el("span", "sc-card-kicker", "Not first"));
    notNow.appendChild(el("p", null, notFirst()));
    next.appendChild(notNow);
    const list = el("div", "sc-opportunities");
    priorities(report).forEach((op, i) => {
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
    caveat.appendChild(el("h2", null, "This is based on your answers. The public internet is the next evidence."));
    caveat.appendChild(el("p", null, "The useful next layer is to open the real website, Google, social profiles and booking channels as a stranger would, then compare what is actually there with the business you just described."));
    caveat.appendChild(el("p", null, "If that external check confirms the same gap, we can recommend a practical next step around the problem — not around a preset package."));
    const actionRow = el("div", "sc-result-actions");
    const email = el("a", "btn btn-primary", "Ask us to check the public version");
    const summary = `${storyUnderstanding()}\n\nMain gap: ${strongestContradiction()}\n\nWhat matters now: ${clean(answers.sixMonths).map((x) => GOAL_LABELS[x]).filter(Boolean).join(", ")}`;
    email.href = `mailto:hello@historianomade.com?subject=${encodeURIComponent(`Story Check — ${answers.businessName || "my business"}`)}&body=${encodeURIComponent(`${summary}\n\nI would like Historia Nomade to compare this with what a stranger actually sees online.`)}`;
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
