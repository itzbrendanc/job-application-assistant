export type FieldType = "text" | "email" | "tel" | "url" | "textarea" | "select" | "checkbox" | "radio" | "unknown";

export type DetectedField = {
  id: string;
  name: string | null;
  label: string | null;
  type: FieldType;
  required: boolean;
  autocomplete: string | null;
  placeholder?: string | null;
  aria_label?: string | null;
  data_automation_id?: string | null;
  form?: string | null;
};

export type FormScanResult = {
  url: string;
  hostname: string;
  adapter: string;
  fields: DetectedField[];
};

export type FillRequest = {
  scan: FormScanResult;
  approvedProfile: Record<string, unknown>;
  // Hard constraint: fill never includes "submit" actions.
};
