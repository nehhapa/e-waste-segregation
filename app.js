
"use strict";

// This demo deliberately uses simple, transparent rules rather than AI.
const STORAGE_KEY = "ewaste-segregation-items-v1";
const CATEGORY_NAMES = ["Repair", "Resale", "Recycle"];
const CONDITION_LABELS = {
  working: "Working",
  repair: "Needs repair",
  notworking: "Not working"
};

function sortItem(type, condition) {
  if (type === "Battery") return "Recycle"; // Batteries need special handling.
  if (condition === "working") return "Resale";
  if (condition === "repair") return "Repair";
  return "Recycle";
}

function loadItems() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  // Storage quota can be exhausted by photos; let the caller show an error.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function thumbnailFor(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(""); return; }
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("Please choose an image smaller than 10 MB."));
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const maxSide = 480;
        const factor = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * factor));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * factor));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Photo processing is not available.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.66));
      } catch {
        reject(new Error("The photo could not be processed."));
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("That image could not be opened."));
    };
    image.src = objectUrl;
  });
}

function showMessage(message, error = false) {
  const result = document.getElementById("result");
  result.textContent = message;
  result.classList.toggle("error", error);
}

function makeListing(item) {
  const row = document.createElement("div");
  row.className = "item";

  let photo;
  if (typeof item.photo === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(item.photo)) {
    photo = document.createElement("img");
    photo.src = item.photo;
    photo.alt = "Photo of " + item.type;
    photo.className = "item-photo";
  } else {
    photo = document.createElement("div");
    photo.className = "item-photo photo-placeholder";
    photo.textContent = "📦";
    photo.setAttribute("aria-hidden", "true");
  }

  const copy = document.createElement("div");
  copy.className = "item-copy";
  const name = document.createElement("div");
  name.className = "item-name";
  name.textContent = item.type;
  const condition = document.createElement("div");
  condition.className = "item-condition";
  condition.textContent = CONDITION_LABELS[item.condition] || item.condition;
  copy.append(name, condition);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.type = "button";
  deleteButton.textContent = "Remove";
  deleteButton.setAttribute("aria-label", "Remove " + item.type);
  deleteButton.addEventListener("click", () => {
    try {
      saveItems(loadItems().filter(existing => existing.id !== item.id));
      renderListings();
      showMessage("Item removed.");
    } catch {
      showMessage("Could not remove this item. Browser storage may be blocked.", true);
    }
  });

  row.append(photo, copy, deleteButton);
  return row;
}

function renderListings() {
  const items = loadItems();
  document.getElementById("total-count").textContent = String(items.length);
  for (const category of CATEGORY_NAMES) {
    const categoryItems = items.filter(item => item.category === category);
    const target = document.getElementById("list-" + category);
    target.replaceChildren();
    document.getElementById("count-" + category).textContent = String(categoryItems.length);
    if (categoryItems.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No items here yet.";
      target.append(empty);
    } else {
      for (const item of categoryItems) target.append(makeListing(item));
    }
  }
  document.getElementById("clearBtn").disabled = items.length === 0;
}

document.getElementById("item-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = document.getElementById("submitBtn");
  const type = document.getElementById("type").value;
  const condition = document.getElementById("condition").value;
  const file = document.getElementById("photo").files[0];
  const category = sortItem(type, condition);
  button.disabled = true;
  showMessage("Processing item…");
  try {
    const photo = await thumbnailFor(file);
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random(),
      type, condition, category, photo, createdAt: new Date().toISOString()
    };
    saveItems([item, ...loadItems()]);
    renderListings();
    document.getElementById("item-form").reset();
    showMessage("Sorted into: " + category + " ✓" + (type === "Battery" ? " (special battery recycling)" : ""));
  } catch (error) {
    const message = error?.name === "QuotaExceededError"
      ? "Browser storage is full. Remove some items or try a smaller photo."
      : (error.message || "Could not save the item.");
    showMessage(message, true);
  } finally {
    button.disabled = false;
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (!confirm("Remove all submitted items from this browser?")) return;
  try {
    saveItems([]);
    renderListings();
    showMessage("All items cleared.");
  } catch {
    showMessage("Could not clear the items. Browser storage may be blocked.", true);
  }
});

renderListings();
