import { BaseAdapter } from "./base";

export class GenericAdapter extends BaseAdapter {
  id = "generic";
  match(_hostname: string): boolean {
    return true;
  }
}

