import { allowedAutomationModeForHost } from "@jaa/shared";
import type { FormScanResult } from "./types";
import { AshbyAdapter } from "../adapters/ashby";
import { GenericAdapter } from "../adapters/generic";
import { GreenhouseAdapter } from "../adapters/greenhouse";
import { LeverAdapter } from "../adapters/lever";
import { SmartRecruitersAdapter } from "../adapters/smartrecruiters";
import { WorkdayAdapter } from "../adapters/workday";

export type AtsAdapter = {
  id: string;
  match(hostname: string): boolean;
  scan(): FormScanResult;
  // Never auto-submit. This should only set field values.
  fillFromApprovedProfile(input: { approvedProfile: Record<string, unknown> }): { filled: number; warnings: string[] };
};

const ADAPTERS: AtsAdapter[] = [
  new WorkdayAdapter(),
  new GreenhouseAdapter(),
  new LeverAdapter(),
  new AshbyAdapter(),
  new SmartRecruitersAdapter(),
  new GenericAdapter()
];

export function pickAdapterForHost(hostname: string): AtsAdapter {
  return ADAPTERS.find((a) => a.match(hostname)) ?? new GenericAdapter();
}

export function enforceSitePolicy(hostname: string): { allowed: boolean; mode: string } {
  const mode = allowedAutomationModeForHost(hostname);
  // Default-safe: allow scan anywhere, but fill only when not blocked.
  if (mode === "blocked") return { allowed: false, mode };
  return { allowed: true, mode };
}

