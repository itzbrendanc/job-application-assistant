import { trackExtensionEvent } from "./api";

const out = document.getElementById("out") as HTMLPreElement;
const scanBtn = document.getElementById("scan") as HTMLButtonElement;
const fillBtn = document.getElementById("fill") as HTMLButtonElement;

void trackExtensionEvent("extension_opened", { surface: "popup" });

scanBtn.addEventListener("click", async () => {
  out.textContent = "Open the Side Panel for the full workflow (sign in → review → fill).";
  fillBtn.disabled = true;
});

fillBtn.addEventListener("click", async () => {
  out.textContent = "Use the Side Panel: review → fill (never auto-submit).";
});
