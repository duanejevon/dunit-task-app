import defaultBg from "./default.jpg";

export interface BuiltInBackground {
  id: string;
  label: string;
  url: string;
}

export const BUILTIN_BACKGROUNDS: BuiltInBackground[] = [{ id: "default", label: "Default", url: defaultBg }];
