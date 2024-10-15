import Protocol from "@/protocols/protocol";
//Utralight Workcell
// Example
<<<<<<< HEAD
import ImageCulturePlate from "@/protocols/workcell_1/production/image_culture_plate"
import PassagingHamilton from "@/protocols/workcell_1/production/passaging"
=======
import ImageCulturePlateBaymax from "@/protocols/example/image_culture_plate";
>>>>>>> clean-up

export const Protocols: Protocol[] = [
  new ImageCulturePlate(),
  new PassagingHamilton(),
];