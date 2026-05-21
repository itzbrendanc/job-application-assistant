import { BaseAdapter } from "./base";
import { scanFields } from "../core/dom";

export class GreenhouseAdapter extends BaseAdapter {
  id = "greenhouse";
  match(hostname: string): boolean {
    return hostname.endsWith("greenhouse.io") || hostname.includes("greenhouse");
  }

  scan() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    // Greenhouse job application pages commonly use #application_form.
    const root =
      document.querySelector("form#application_form") ??
      document.querySelector("form.application-form") ??
      document.querySelector("main") ??
      document;
    return { url, hostname, adapter: this.id, fields: scanFields(root) };
  }
}
