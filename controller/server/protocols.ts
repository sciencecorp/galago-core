import Protocol from "@/protocols/protocol";


// Baymax Workcell
// Production
import OpentronsMediaExchangeBaymax from "@/protocols/baymax/production/opentrons_media_exchange";
import OpentronsMediaExchange96w384Baymax from "@/protocols/baymax/production/opentrons_media_exchange_96_384";
import ImageCulturePlateBaymax from "@/protocols/baymax/production/image_culture_plate";
import OpentronsPassageBaymax from "@/protocols/baymax/production/passage_culture_plate"; 
import TransfectCulture from "@/protocols/baymax/production/transfect_culture";

// Ultralight Workcell
// Production
import OpentronsMediaExchangeUltralight from "@/protocols/ultralight/production/opentrons_media_exchange";
import OpentronsMediaExchange96w384Ultralight from "@/protocols/ultralight/production/opentrons_media_exchange_96_384";
import OpentronsPassageUltralight from "@/protocols/baymax/production/passage_culture_plate"; 
import ImageCulturePlateUltralight from "@/protocols/ultralight/production/image_culture_plate";
import PlateWashBiolabTesting from "@/protocols/biolab/production/plate_wash_testing";

export const Protocols: Protocol[] = [
  new OpentronsMediaExchangeBaymax(),
  new OpentronsMediaExchange96w384Baymax(),
  new ImageCulturePlateBaymax(),
  new OpentronsPassageBaymax(),
  new OpentronsMediaExchangeUltralight(),
  new OpentronsMediaExchange96w384Ultralight(),
  new OpentronsPassageUltralight(),
  new ImageCulturePlateUltralight(),
  new TransfectCulture(),
  new PlateWashBiolabTesting()
];