import { BaseAdapter } from "./base";
import { scanFields } from "../core/dom";

export class WorkdayAdapter extends BaseAdapter {
  id = "workday";
  match(hostname: string): boolean {
    return hostname.includes("myworkdayjobs.com") || hostname.includes("workday");
  }

  scan() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    // Workday pages are highly dynamic; prefer scanning within app containers to reduce noise.
    const root =
      document.querySelector('[data-automation-id="applyForm"]') ??
      document.querySelector('[data-automation-id="application"]') ??
      document.querySelector("main") ??
      document;
    return { url, hostname, adapter: this.id, fields: scanFields(root) };
  }
}
