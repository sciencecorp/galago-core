import Protocol from "@/protocols/protocol";
//Utralight Workcell
// Example
import ImageCulturePlate from "@/protocols/workcell_1/production/image_culture_plate"
import PassagingHamilton from "@/protocols/workcell_1/production/passaging"

export const Protocols: Protocol[] = [
  new ImageCulturePlate(),
  new PassagingHamilton(),
];