import type { AtsAdapter } from "../core/adapters";
import type { FormScanResult } from "../core/types";
import { scanFields } from "../core/dom";

export abstract class BaseAdapter implements AtsAdapter {
  abstract id: string;
  abstract match(hostname: string): boolean;

  scan(): FormScanResult {
    const url = window.location.href;
    const hostname = window.location.hostname;
    return { url, hostname, adapter: this.id, fields: scanFields() };
  }

  fillFromApprovedProfile(_input: { approvedProfile: Record<string, unknown> }): { filled: number; warnings: string[] } {
    // Skeleton: mapping is adapter-specific and must be conservative.
    // Guardrail: never guess sensitive answers. Leave them blank and ask the user.
    return {
      filled: 0,
      warnings: [
        "Autofill is stubbed. This extension never auto-submits forms and will not answer sensitive questions without explicit user input."
      ]
    };
  }
}

