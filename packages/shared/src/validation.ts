export function assertNever(message: string): never {
  throw new Error(message);
}

export function clampScore0to100(score: number): number {
  if (Number.isNaN(score)) return 0;
  if (score < 0) return 0;
  if (score > 100) return 100;
  return score;
}

export function requireUserApproval<T>(
  value: T,
  opts: { approved: boolean; reason: string }
): T {
  if (!opts.approved) {
    throw new Error(`User approval required: ${opts.reason}`);
  }
  return value;
}

