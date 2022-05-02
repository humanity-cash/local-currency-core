/* eslint-disable spellcheck/spell-checker */

export interface BlockList {
  name: string;
  dwollaUserId: string;
  reason: "TEST" | "ABUSE" | "REGION" | "OTHER";
}

export const BUSINESS_BLOCKLIST: BlockList[] = [
  {
    name: "Neighborly Capital Company",
    dwollaUserId: "b1ca892f-9ba6-4bb4-8d82-cb657cae0fc9",
    reason: "OTHER",
  },
  {
    name: "Dionysus Labs LLC",
    dwollaUserId: "bf7facc4-6800-4737-b4dd-dddac82b4d33",
    reason: "OTHER",
  },
  {
    name: "Humanity Cash Administration",
    dwollaUserId: "8bde3bf2-6621-4b0b-a16a-9c47ff088003",
    reason: "TEST",
  },
  {
    name: "Catsitter, Inc",
    dwollaUserId: "aeae4eb2-eb79-4fc0-9ac4-77548119e764",
    reason: "TEST",
  },
  {
    name: "Jared's Jumpropes",
    dwollaUserId: "1d8c627d-a5f4-4560-b9af-94b130eac967",
    reason: "TEST",
  },
  {
    name: "PLB Direct Import / Export LLC",
    dwollaUserId: "b96ea9ba-478f-45b4-812c-dbba09a2ddf1",
    reason: "REGION",
  },
  {
    name: "lets go",
    dwollaUserId: "69e3d2b9-881c-4896-ba75-9a8e20b54846",
    reason: "OTHER",
  },
  {
    name: "National Hall Capital",
    dwollaUserId: "4a43bce0-849c-477d-8337-df2350d757b1",
    reason: "REGION",
  },
];
