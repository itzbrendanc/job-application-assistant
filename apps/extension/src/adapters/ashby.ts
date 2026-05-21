import { BaseAdapter } from "./base";

export class AshbyAdapter extends BaseAdapter {
  id = "ashby";
  match(hostname: string): boolean {
    return hostname.includes("ashbyhq.com") || hostname.includes("ashby");
  }
}

