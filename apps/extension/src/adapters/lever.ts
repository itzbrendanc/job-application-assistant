import { BaseAdapter } from "./base";
import { scanFields } from "../core/dom";

export class LeverAdapter extends BaseAdapter {
  id = "lever";
  match(hostname: string): boolean {
    return hostname.endsWith("lever.co") || hostname.includes("lever");
  }

  scan() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    // Lever application form is typically a <form> under .application-form.
    const root =
      document.querySelector("form.application-form") ??
      document.querySelector(".application-form") ??
      document.querySelector("main") ??
      document;
    return { url, hostname, adapter: this.id, fields: scanFields(root) };
  }
}
