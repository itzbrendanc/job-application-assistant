import type { DetectedField, FieldType } from "./types";

function fieldTypeFromEl(el: Element): FieldType {
  if (el instanceof HTMLTextAreaElement) return "textarea";
  if (el instanceof HTMLSelectElement) return "select";
  if (el instanceof HTMLInputElement) {
    const t = (el.getAttribute("type") ?? "text").toLowerCase();
    if (t === "email") return "email";
    if (t === "tel") return "tel";
    if (t === "url") return "url";
    if (t === "checkbox") return "checkbox";
    if (t === "radio") return "radio";
    return "text";
  }
  return "unknown";
}

function labelFor(el: HTMLElement): string | null {
  const id = el.getAttribute("id");
  if (id) {
    const l = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (l?.textContent) return l.textContent.trim().slice(0, 160);
  }
  const wrap = el.closest("label");
  if (wrap?.textContent) return wrap.textContent.trim().slice(0, 160);
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.trim().slice(0, 160);
  const ph = el.getAttribute("placeholder");
  if (ph) return ph.trim().slice(0, 160);
  return null;
}

function shouldIgnore(el: HTMLElement): boolean {
  if (el instanceof HTMLInputElement) {
    const t = (el.getAttribute("type") ?? "text").toLowerCase();
    if (t === "hidden" || t === "submit" || t === "button" || t === "reset") return true;
    if (t === "file" || t === "password") return true;
  }
  const name = (el.getAttribute("name") ?? "").toLowerCase();
  const id = (el.getAttribute("id") ?? "").toLowerCase();
  const label = (labelFor(el) ?? "").toLowerCase();
  const blob = `${name} ${id} ${label}`.trim();

  // Conservative: avoid captcha and obvious anti-bot honeypots.
  if (blob.includes("captcha") || blob.includes("g-recaptcha") || blob.includes("h-captcha") || blob.includes("honeypot")) return true;
  return false;
}

export function scanFields(root: ParentNode = document): DetectedField[] {
  const nodes = Array.from(root.querySelectorAll("input, textarea, select"))
    .filter((el) => el instanceof HTMLElement)
    .filter((el) => !shouldIgnore(el as HTMLElement)) as HTMLElement[];

  return nodes.map((el, idx) => ({
    id: el.getAttribute("id") || `field_${idx}`,
    name: el.getAttribute("name"),
    label: labelFor(el),
    type: fieldTypeFromEl(el),
    required: (el as any).required === true,
    autocomplete: el.getAttribute("autocomplete"),
    placeholder: el.getAttribute("placeholder"),
    aria_label: el.getAttribute("aria-label"),
    data_automation_id: el.getAttribute("data-automation-id"),
    form: (el.closest("form") as HTMLFormElement | null)?.getAttribute("id") ?? null,
  }));
}

export function fillFieldValue(el: Element, value: string): boolean {
  // Hard constraint: no submit button interactions. Only set values.
  if (el instanceof HTMLTextAreaElement) {
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox" || el.type === "radio") return false;
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }
  if (el instanceof HTMLSelectElement) {
    const opt = Array.from(el.options).find((o) => o.value === value || o.text.toLowerCase() === value.toLowerCase());
    if (!opt) return false;
    el.value = opt.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  return false;
}
