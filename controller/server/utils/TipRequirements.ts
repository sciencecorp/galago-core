import { Instrument, Inventory, Nest, Plate, Well, Reagent } from "@/types/api";
import { Any } from "@grpc/grpc-js/build/src/generated/google/protobuf/Any";

enum TipTypes {
  "20 uL",
  "200 uL",
  "1000 uL",
}

export class TipsRequirements {
  updateReagentInventory = (wells: Well[], inventory: Inventory) => {
    if (!wells || wells.length === 0) {
      return;
    }
    wells.forEach((well) => {
      inventory.reagents = inventory.reagents.filter(
        (reagent) => reagent.well_id !== well.id,
      );
    });
  };

  findAvailableTips = (
    tipType: TipTypes,
    wells_array: string[],
    inventory: Inventory,
  ) => {};
}
