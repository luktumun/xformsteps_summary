(() => {
  const shell = document.querySelector(".form-shell");
  const steps = [...document.querySelectorAll(".form-step")];
  const indicators = [...document.querySelectorAll(".step-nav-item")];
  const nextButton = document.querySelector("#next-button");
  const backButton = document.querySelector("#back-button");
  const billingToggle = document.querySelector("#billing-toggle");
  const planCards = [...document.querySelectorAll(".plan_card")];
  const addonInputs = [...document.querySelectorAll('input[name="addons"]')];
  const form = document.querySelector("#personal-info-form");
  let currentStep = 1;
  let selectedPlan = "Arcade";
  let yearly = false;

  const plans = {
    Arcade: { monthly: 9, yearly: 90 },
    Advanced: { monthly: 12, yearly: 120 },
    Pro: { monthly: 15, yearly: 150 },
  };

  function money(amount) {
    return `$${amount}/${yearly ? "yr" : "mo"}`;
  }

  function renderPlanPrices() {
    document.body.classList.toggle("is-yearly", yearly);
    planCards.forEach((card) => {
      const price = plans[card.dataset.plan][yearly ? "yearly" : "monthly"];
      card.querySelector(".plan-price").textContent = money(price);
    });
    addonInputs.forEach((input) => {
      const price = Number(input.dataset[yearly ? "yearly" : "monthly"]);
      input.closest(".addon_card").querySelector(".addon-price").textContent = `+$${price}/${yearly ? "yr" : "mo"}`;
    });
    document.querySelector('[data-period-label="monthly"]').classList.toggle("is-current", !yearly);
    document.querySelector('[data-period-label="yearly"]').classList.toggle("is-current", yearly);
  }

  function updateSummary() {
    const planPrice = plans[selectedPlan][yearly ? "yearly" : "monthly"];
    document.querySelector("#summary-plan-name").textContent = `${selectedPlan} (${yearly ? "Yearly" : "Monthly"})`;
    document.querySelector("#summary-plan-price").textContent = money(planPrice);
    document.querySelector("#summary-total-label").textContent = `Total (per ${yearly ? "year" : "month"})`;

    const selectedAddons = addonInputs.filter((input) => input.checked);
    const addonTotal = selectedAddons.reduce(
      (total, input) => total + Number(input.dataset[yearly ? "yearly" : "monthly"]),
      0,
    );
    const addonRows = selectedAddons.map((input) => {
      const amount = Number(input.dataset[yearly ? "yearly" : "monthly"]);
      const row = document.createElement("div");
      row.className = "summary-addon-row";
      row.innerHTML = `<span>${input.value}</span><strong>+${money(amount)}</strong>`;
      return row;
    });
    const summaryAddons = document.querySelector("#summary-addons");
    summaryAddons.replaceChildren(...addonRows);
    document.querySelector("#summary-total-price").textContent = money(planPrice + addonTotal);
  }

  function showStep(stepNumber) {
    currentStep = stepNumber;
    steps.forEach((step) => {
      const active = Number(step.dataset.step) === stepNumber;
      step.hidden = !active;
      step.classList.toggle("is-visible", active);
    });
    indicators.forEach((indicator) => {
      const active = Number(indicator.dataset.indicator) === Math.min(stepNumber, 4);
      indicator.classList.toggle("is-active", active);
      if (active) {
        indicator.setAttribute("aria-current", "step");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });
    backButton.hidden = stepNumber === 1 || stepNumber === 5;
    nextButton.hidden = stepNumber === 5;
    nextButton.textContent = stepNumber === 4 ? "Confirm" : "Next step";
    nextButton.classList.toggle("is-confirm", stepNumber === 4);
    if (stepNumber === 4) updateSummary();
    if (stepNumber === 5) shell.classList.add("is-complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validatePersonalInfo() {
    const fields = [
      { input: form.elements.userName, message: "This field is required" },
      { input: form.elements.email, message: "Enter a valid email address", valid: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) },
      { input: form.elements.phone, message: "This field is required", valid: (value) => /^[+()\d\s.-]{7,}$/.test(value) },
    ];
    let valid = true;
    fields.forEach(({ input, message, valid: check }) => {
      const value = input.value.trim();
      const hasError = !value || (check ? !check(value) : false);
      const error = document.querySelector(`#${input.name}-error`);
      input.setAttribute("aria-invalid", String(hasError));
      error.textContent = hasError ? message : "";
      if (hasError) valid = false;
    });
    if (!valid) form.querySelector('[aria-invalid="true"]').focus();
    return valid;
  }

  nextButton.addEventListener("click", () => {
    if (currentStep === 1 && !validatePersonalInfo()) return;
    if (currentStep === 4) {
      document.querySelector("#thank-you-name").textContent = form.elements.userName.value.trim();
      document.querySelector("#thank-you-email").textContent = form.elements.email.value.trim();
    }
    showStep(currentStep + 1);
  });

  backButton.addEventListener("click", () => showStep(currentStep - 1));

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.hasAttribute("aria-invalid")) return;
    input.removeAttribute("aria-invalid");
    document.querySelector(`#${input.name}-error`).textContent = "";
  });

  planCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectedPlan = card.dataset.plan;
      planCards.forEach((plan) => {
        const selected = plan === card;
        plan.classList.toggle("selected", selected);
        plan.setAttribute("aria-pressed", String(selected));
      });
    });
  });

  billingToggle.addEventListener("change", () => {
    yearly = billingToggle.checked;
    renderPlanPrices();
  });

  addonInputs.forEach((input) => input.addEventListener("change", updateSummary));
  document.querySelector('[data-go-to="2"]').addEventListener("click", () => showStep(2));

  renderPlanPrices();
})();
