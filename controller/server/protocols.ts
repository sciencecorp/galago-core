import Protocol from "@/protocols/protocol";

// Example Protocol
import ImagingProtocol from "@/protocols/example/image_culture_plate";

export const Protocols: Protocol[] = [
  new ImagingProtocol(),
];