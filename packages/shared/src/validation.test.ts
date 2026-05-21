import test from "node:test";
import assert from "node:assert/strict";
import { clampScore0to100 } from "./validation.js";

test("clampScore0to100 clamps", () => {
  assert.equal(clampScore0to100(-1), 0);
  assert.equal(clampScore0to100(101), 100);
  assert.equal(clampScore0to100(50), 50);
});

