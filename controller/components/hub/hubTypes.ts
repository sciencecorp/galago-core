export type HubItemType =
  | "workcells"
  | "protocols"
  | "variables"
  | "scripts"
  | "labware"
  | "forms"
  | "inventory";

export type HubItemSummary = {
  id: string;
  type: HubItemType;
  name: string;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  /**
   * Where this item comes from.
   * - "hub": user-uploaded items stored in the Hub service
   * - "library": git-tracked items shipped with the repo under `public/hub-library`
   */
  source?: "hub" | "library";
};

export type HubItem = HubItemSummary & {
  payload: any;
};
