import type { FormScanResult } from "./core/types";

type State = {
  lastScan: FormScanResult | null;
};

const state: State = { lastScan: null };

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "jaa.scan.result") {
    state.lastScan = msg.payload as FormScanResult;
    sendResponse({ ok: true });
    return true;
  }
  if (msg?.type === "jaa.scan.getLast") {
    sendResponse({ ok: true, payload: state.lastScan });
    return true;
  }
  return false;
});

