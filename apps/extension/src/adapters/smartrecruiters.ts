import { BaseAdapter } from "./base";

export class SmartRecruitersAdapter extends BaseAdapter {
  id = "smartrecruiters";
  match(hostname: string): boolean {
    return hostname.includes("smartrecruiters.com");
  }
}

