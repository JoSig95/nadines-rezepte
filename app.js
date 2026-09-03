const layouts = {
  editorial: {
    number: "Layout 01",
    title: "Editorial",
    description: "Großes Titelbild, luftige Typografie und ein warmer Magazincharakter.",
  },
  split: {
    number: "Layout 02",
    title: "Zweigeteilt",
    description: "Zutaten links, Zubereitung rechts – besonders übersichtlich beim Kochen.",
  },
  compact: {
    number: "Layout 03",
    title: "Kompakt",
    description: "Informationsstark und platzsparend, mit klarer Kochkarten-Anmutung.",
  },
};

const mount = document.querySelector("#recipe-mount");
const printButton = document.querySelector("#print-selected");
const printLeftLabel = document.querySelector("#print-left-label");
const printRightLabel = document.querySelector("#print-right-label");
const recipeControls = document.querySelector("#recipe-controls");
const clearSideButtons = [...document.querySelectorAll("[data-clear-side]")];
const printSheet = document.querySelector("#print-sheet");
const printSlotLeft = document.querySelector("#print-slot-left");
const printSlotRight = document.querySelector("#print-slot-right");
let recipe;
let recipes = [];
let selectedLayout = "compact";
let printSelection = { left: "", right: "" };
let printedRecipes = new Set();

const PRINTED_STORAGE_KEY = "recipe-collection-printed-v1";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const ingredientList = (items) => {
  let activeGroup = null;
  const rows = items.map((item) => {
    const groupHeading = item.group && item.group !== activeGroup
      ? `<li class="ingredient-group"><span>${escapeHtml(item.group)}</span></li>`
      : "";
    activeGroup = item.group || null;
    return `${groupHeading}<li><strong>${escapeHtml(item.amount)}</strong><span>${escapeHtml(item.item)}</span></li>`;
  }).join("");

  return `<ul class="ingredients">${rows}</ul>`;
};

const stepList = (steps) => `
  <ol class="steps">
    ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
  </ol>`;

const recipeTitle = (entry) => Array.isArray(entry.titleLines) && entry.titleLines.length
  ? entry.titleLines.map((line) => escapeHtml(line)).join("<br>")
  : escapeHtml(entry.name);

const densityClass = (entry) => {
  const classes = [];
  if (entry.cardPages === 2) classes.push("is-two-card");
  if (Array.isArray(entry.titleLines) && entry.titleLines.length > 1) classes.push("has-stacked-title");
  return classes.join(" ");
};

const meta = (entry) => `
  <div class="meta-row" aria-label="Rezeptinformationen">
    <span class="meta-pill">⏱ ${escapeHtml(entry.totalTime)}</span>
    <span class="meta-pill">${escapeHtml(entry.yield || `${entry.servings} Portionen`)}</span>
    <span class="meta-pill">${escapeHtml(entry.difficulty)}</span>
  </div>`;

function renderEditorial(entry) {
  return `
    <article class="recipe-page layout-editorial ${densityClass(entry)}" aria-label="${escapeHtml(entry.name)} im Editorial-Layout">
      <div class="hero"><img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.imageAlt)}" /></div>
      <header class="title-block">
        <h1>${recipeTitle(entry)}</h1>
        <p class="subtitle">${escapeHtml(entry.description)}</p>
        ${meta(entry)}
      </header>
      <div class="content-grid">
        <section><h2 class="section-label">Zutaten</h2>${ingredientList(entry.ingredients)}</section>
        <section><h2 class="section-label">Zubereitung</h2>${stepList(entry.steps)}</section>
      </div>
    </article>`;
}

function renderSplit(entry) {
  return `
    <article class="recipe-page layout-split ${densityClass(entry)}" aria-label="${escapeHtml(entry.name)} im zweigeteilten Layout">
      <aside class="side">
        <div class="hero"><img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.imageAlt)}" /></div>
        <div class="side-copy"><h2 class="section-label">Zutaten</h2>${ingredientList(entry.ingredients)}</div>
      </aside>
      <div class="main-copy">
        <p class="overline">Schnell &amp; vegetarisch</p>
        <h1>${recipeTitle(entry)}</h1>
        <p class="subtitle">${escapeHtml(entry.description)}</p>
        ${meta(entry)}
        <section><h2 class="section-label">Zubereitung</h2>${stepList(entry.steps)}</section>
      </div>
    </article>`;
}

function renderCompactPages(entry) {
  const firstPage = `
    <article class="recipe-page layout-compact ${densityClass(entry)}" aria-label="${escapeHtml(entry.name)} im kompakten Layout">
      <header class="top">
        <div class="title-block"><h1>${recipeTitle(entry)}</h1>${meta(entry)}</div>
        <div class="hero"><img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.imageAlt)}" /></div>
      </header>
      <div class="${entry.cardPages === 2 ? "ingredients-page" : "content-grid"}">
        <section><h2 class="section-label">Zutaten</h2>${ingredientList(entry.ingredients)}</section>
        ${entry.cardPages === 2 ? "" : `<section>
          <h2 class="section-label">Zubereitung</h2>${stepList(entry.steps)}
          <p class="tip"><strong>Tipp:</strong> ${escapeHtml(entry.tip)}</p>
        </section>`}
      </div>
    </article>`;

  if (entry.cardPages !== 2) return [firstPage];

  const secondPage = `
    <article class="recipe-page layout-compact is-two-card continuation-card" aria-label="${escapeHtml(entry.name)} – Zubereitung">
      <header class="continuation-header">
        <h1>${recipeTitle(entry)}</h1>
        ${meta(entry)}
      </header>
      <section class="preparation-page">
        <h2 class="section-label">Zubereitung</h2>
        ${stepList(entry.steps)}
        <p class="tip"><strong>Tipp:</strong> ${escapeHtml(entry.tip)}</p>
      </section>
    </article>`;

  return [firstPage, secondPage];
}

function renderCompact(entry) {
  return renderCompactPages(entry).join("");
}

const renderers = { editorial: renderEditorial, split: renderSplit, compact: renderCompact };

const categoryDefinitions = [
  { name: "Brote", tags: ["brot"] },
  { name: "Kuchen & Torten", tags: ["kuchen", "käsekuchen", "blechkuchen"] },
  { name: "Gebäck & Süßes", tags: ["cookies", "hefegebäck", "gebäck", "waffeln", "süßes"] },
  { name: "Desserts", tags: ["dessert"] },
  { name: "Salate & Beilagen", tags: ["salat", "salsa", "beilage"] },
  { name: "Hauptgerichte", tags: ["pasta"] },
  { name: "Herzhaftes", tags: ["fisch", "schinken", "party"] },
];

function recipeCategory(entry) {
  const tags = new Set(entry.tags || []);
  return categoryDefinitions.find((category) => category.tags.some((tag) => tags.has(tag)))?.name || "Sonstiges";
}

function loadPrintedRecipes() {
  try {
    const stored = JSON.parse(localStorage.getItem(PRINTED_STORAGE_KEY) || "[]");
    return new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function savePrintedRecipes() {
  try {
    localStorage.setItem(PRINTED_STORAGE_KEY, JSON.stringify([...printedRecipes]));
  } catch {
    // Die Sammlung bleibt auch dann nutzbar, wenn der Browser lokalen Speicher blockiert.
  }
}

function renderRecipeList() {
  const list = document.querySelector("#recipe-list");
  const categoryNames = [...categoryDefinitions.map((category) => category.name), "Sonstiges"];
  const currentCategory = recipe ? recipeCategory(recipe) : categoryNames[0];

  list.innerHTML = categoryNames.map((categoryName) => {
    const categoryRecipes = recipes
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => recipeCategory(entry) === categoryName);
    if (!categoryRecipes.length) return "";

    const rows = categoryRecipes.map(({ entry, index }) => `
      <div class="recipe-list-row ${printedRecipes.has(entry.id) ? "is-printed" : ""}">
        <button class="recipe-select" type="button" data-recipe-index="${index}" aria-current="${entry.id === recipe?.id ? "true" : "false"}">
          <span>${String(entry.recipeNumber || index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(entry.name)}</strong>
          <small>${escapeHtml(entry.totalTime)}</small>
        </button>
        <label class="printed-check">
          <input type="checkbox" data-printed-id="${escapeHtml(entry.id)}" ${printedRecipes.has(entry.id) ? "checked" : ""} />
          <span>Gedruckt</span>
        </label>
      </div>`).join("");

    return `
      <details class="recipe-category" ${categoryName === currentCategory ? "open" : ""}>
        <summary>
          <strong>${escapeHtml(categoryName)}</strong>
          <span>${categoryRecipes.length}</span>
        </summary>
        <div class="category-recipes">${rows}</div>
      </details>`;
  }).join("");

  list.querySelectorAll("[data-recipe-index]").forEach((button) => {
    button.addEventListener("click", () => selectRecipe(Number(button.dataset.recipeIndex)));
  });
  list.querySelectorAll("[data-printed-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) printedRecipes.add(checkbox.dataset.printedId);
      else printedRecipes.delete(checkbox.dataset.printedId);
      checkbox.closest(".recipe-list-row")?.classList.toggle("is-printed", checkbox.checked);
      savePrintedRecipes();
    });
  });
}

function updateCurrentRecipeMarker() {
  document.querySelectorAll("[data-recipe-index]").forEach((button) => {
    const entry = recipes[Number(button.dataset.recipeIndex)];
    button.setAttribute("aria-current", entry?.id === recipe?.id ? "true" : "false");
  });
}

function selectRecipe(index) {
  recipe = recipes[index];
  if (!recipe) return;
  updateCurrentRecipeMarker();
  mount.innerHTML = renderers[selectedLayout](recipe);
  renderRecipeControls();
}

function selectedRecipe(id) {
  return recipes.find((entry) => entry.id === id);
}

function updatePrintButton() {
  printButton.disabled = !printSelection.left && !printSelection.right;
  printButton.textContent = "Rezepte drucken";
}

function updatePrintOverview() {
  const leftRecipe = selectedRecipe(printSelection.left);
  const rightRecipe = selectedRecipe(printSelection.right);
  printLeftLabel.textContent = leftRecipe?.name || "Nicht belegt";
  printRightLabel.textContent = rightRecipe?.name || "Nicht belegt";
  clearSideButtons.forEach((button) => {
    button.disabled = !printSelection[button.dataset.clearSide];
  });
  updatePrintButton();
  if (recipe) renderRecipeControls();
}

function assignRecipeToSide(side, entry) {
  const currentTwoCard = [selectedRecipe(printSelection.left), selectedRecipe(printSelection.right)]
    .some((selected) => selected?.cardPages === 2);
  if (currentTwoCard) printSelection = { left: "", right: "" };

  if (entry.cardPages === 2) printSelection = { left: entry.id, right: entry.id };
  else printSelection[side] = entry.id;
  updatePrintOverview();
}

function clearPrintSide(side) {
  const entry = selectedRecipe(printSelection[side]);
  if (entry?.cardPages === 2) printSelection = { left: "", right: "" };
  else printSelection[side] = "";
  updatePrintOverview();
}

function renderRecipeControls() {
  if (!recipe) {
    recipeControls.innerHTML = "";
    return;
  }

  const usesBothSides = recipe.cardPages === 2;
  const sideButtons = usesBothSides
    ? `<button type="button" data-assign-both aria-pressed="${printSelection.left === recipe.id && printSelection.right === recipe.id}">Beide Seiten verwenden</button>`
    : `
      <button type="button" data-assign-side="left" aria-pressed="${printSelection.left === recipe.id}">Auf linke Seite</button>
      <button type="button" data-assign-side="right" aria-pressed="${printSelection.right === recipe.id}">Auf rechte Seite</button>`;

  recipeControls.innerHTML = `
    <div>
      <span>Für den Druckbogen</span>
      <strong>${escapeHtml(recipe.name)}</strong>
      <small>${usesBothSides ? "Dieses Rezept benötigt beide DIN-A5-Seiten." : "Lege das Rezept links oder rechts auf den DIN-A4-Bogen."}</small>
    </div>
    <div class="side-buttons">${sideButtons}</div>`;

  recipeControls.querySelectorAll("[data-assign-side]").forEach((button) => {
    button.addEventListener("click", () => assignRecipeToSide(button.dataset.assignSide, recipe));
  });
  recipeControls.querySelector("[data-assign-both]")?.addEventListener("click", () => assignRecipeToSide("left", recipe));
}

function renderPrintSheet() {
  const leftRecipe = selectedRecipe(printSelection.left);
  const rightRecipe = selectedRecipe(printSelection.right);
  const twoCardRecipe = [leftRecipe, rightRecipe].find((entry) => entry?.cardPages === 2);

  if (twoCardRecipe) {
    const pages = renderCompactPages(twoCardRecipe);
    printSlotLeft.innerHTML = pages[0];
    printSlotRight.innerHTML = pages[1];
  } else {
    printSlotLeft.innerHTML = leftRecipe ? renderers[selectedLayout](leftRecipe) : "";
    printSlotRight.innerHTML = rightRecipe ? renderers[selectedLayout](rightRecipe) : "";
  }
  printSheet.setAttribute("aria-hidden", "false");
}

function waitForImage(image) {
  const decodeImage = () => typeof image.decode === "function"
    ? image.decode().catch(() => undefined)
    : Promise.resolve();

  if (image.complete) return decodeImage();

  return new Promise((resolve) => {
    const finish = () => {
      image.removeEventListener("load", finish);
      image.removeEventListener("error", finish);
      resolve();
    };
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  }).then(decodeImage);
}

function waitForPrintImages() {
  const images = [...printSheet.querySelectorAll("img")];
  return Promise.all(images.map(waitForImage));
}

const waitForPaint = () => new Promise((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(resolve));
});

function selectLayout(layout) {
  if (!layouts[layout]) layout = "compact";
  selectedLayout = layout;
  document.querySelectorAll("[data-layout]").forEach((button) => {
    button.setAttribute("aria-selected", button.dataset.layout === layout ? "true" : "false");
  });
  if (recipe) mount.innerHTML = renderers[layout](recipe);
}

document.querySelectorAll("[data-layout]").forEach((button) => {
  button.addEventListener("click", () => selectLayout(button.dataset.layout));
});

clearSideButtons.forEach((button) => {
  button.addEventListener("click", () => clearPrintSide(button.dataset.clearSide));
});
printButton.addEventListener("click", async () => {
  if (!printSelection.left && !printSelection.right) return;
  printButton.disabled = true;
  printButton.textContent = "Bilder werden geladen …";
  renderPrintSheet();
  try {
    await waitForPrintImages();
    await waitForPaint();
    window.print();
  } finally {
    updatePrintButton();
  }
});
window.addEventListener("afterprint", () => printSheet.setAttribute("aria-hidden", "true"));

const loadRecipeData = () => {
  if (window.RECIPE_DATA) return Promise.resolve(window.RECIPE_DATA);
  return fetch("data/recipes.json").then((response) => {
    if (!response.ok) throw new Error("Rezeptdaten konnten nicht geladen werden.");
    return response.json();
  });
};

loadRecipeData()
  .then((data) => {
    recipes = data.recipes;
    selectedLayout = data.selectedLayout || "compact";
    recipe = recipes.at(-1);
    printedRecipes = loadPrintedRecipes();
    selectLayout(selectedLayout);
    renderRecipeList();
    updatePrintOverview();
  })
  .catch((error) => {
    mount.innerHTML = `<p class="error-message">${escapeHtml(error.message)} Bitte prüfe, ob der Ordner data vollständig vorhanden ist.</p>`;
  });
