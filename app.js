const transcript = [
  {
    time: "00:10",
    speaker: "Agent",
    text: "Thanks for calling BrightMove. I can walk you through our coverage options and pricing today.",
  },
  {
    time: "00:25",
    speaker: "Caller",
    text: "Yes, I want to make sure our furniture is protected during the move.",
  },
  {
    time: "00:40",
    speaker: "Agent",
    text: "We include released value protection, and you can upgrade to full value protection for high-end items.",
  },
  {
    time: "01:05",
    speaker: "Agent",
    text: "Pricing starts at $1,450 for the base crew, and we offer bundled storage at $120 per month.",
  },
  {
    time: "01:32",
    speaker: "Caller",
    text: "Great. Does the deposit change if we add packing?",
  },
  {
    time: "01:46",
    speaker: "Agent",
    text: "Packing is an add-on at $380, and the total estimate would be $1,830 with that service.",
  },
];

const keywords = {
  coverage: ["coverage", "protection", "full value", "released value"],
  pricing: ["pricing", "price", "deposit", "estimate", "per month", "$"],
};

const transcriptBody = document.getElementById("transcript-body");
const coverageCount = document.getElementById("coverage-count");
const pricingCount = document.getElementById("pricing-count");
const coverageChips = document.getElementById("coverage-chips");
const pricingChips = document.getElementById("pricing-chips");
const keywordForm = document.getElementById("keyword-form");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderChips = () => {
  const renderGroup = (container, list, category) => {
    container.innerHTML = list
      .map((keyword) => `<span class="chip ${category}">${keyword}</span>`)
      .join("");
  };

  renderGroup(coverageChips, keywords.coverage, "coverage");
  renderGroup(pricingChips, keywords.pricing, "pricing");
};

const highlightText = (text) => {
  let updated = text;
  Object.entries(keywords).forEach(([category, list]) => {
    list.forEach((keyword) => {
      const pattern = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
      updated = updated.replace(
        pattern,
        `<span class="highlight ${category}">$1</span>`
      );
    });
  });
  return updated;
};

const computeCounts = () => {
  const counts = { coverage: 0, pricing: 0 };
  transcript.forEach(({ text }) => {
    Object.entries(keywords).forEach(([category, list]) => {
      list.forEach((keyword) => {
        const pattern = new RegExp(escapeRegExp(keyword), "gi");
        const matches = text.match(pattern);
        if (matches) {
          counts[category] += matches.length;
        }
      });
    });
  });

  coverageCount.textContent = counts.coverage;
  pricingCount.textContent = counts.pricing;
};

const renderTranscript = () => {
  transcriptBody.innerHTML = transcript
    .map(
      ({ time, speaker, text }) => `
        <div class="line">
          <div class="timestamp">${time}</div>
          <div>
            <strong>${speaker}:</strong>
            <span>${highlightText(text)}</span>
          </div>
        </div>
      `
    )
    .join("");
};

keywordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const keywordInput = document.getElementById("keyword-input");
  const keywordCategory = document.getElementById("keyword-category");

  const value = keywordInput.value.trim();
  if (!value) {
    return;
  }

  keywords[keywordCategory.value].push(value);
  keywordInput.value = "";
  renderChips();
  renderTranscript();
  computeCounts();
});

renderChips();
renderTranscript();
computeCounts();
