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
};

export type HubItem = HubItemSummary & {
  payload: any;
};
