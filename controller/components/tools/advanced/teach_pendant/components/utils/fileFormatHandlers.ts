import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types";
import { xml2js, js2xml } from "xml-js";

export interface TeachPendantData {
  teachPoints?: TeachPoint[];
  motionProfiles?: MotionProfile[];
  gripParams?: GripParams[];
  sequences?: Sequence[];
}

export interface FileFormatHandler {
  validate: (data: any) => boolean;
  parse: (data: string) => TeachPendantData;
  serialize: (data: TeachPendantData) => string;
  fileExtension: string;
  mimeType: string;
}

const jsonHandler: FileFormatHandler = {
  validate: (data: any) => {
    return data && typeof data === "object" && (
      Array.isArray(data.teachPoints) ||
      Array.isArray(data.motionProfiles) ||
      Array.isArray(data.gripParams) ||
      Array.isArray(data.sequences)
    );
  },
  parse: (data: string) => {
    const parsed = JSON.parse(data);
    // Handle both new format and legacy format
    if (parsed.data) {
      return parsed.data;
    }
    return parsed;
  },
  serialize: (data: TeachPendantData) => {
    return JSON.stringify({
      version: "1.0",
      timestamp: new Date().toISOString(),
      data
    }, null, 2);
  },
  fileExtension: ".json",
  mimeType: "application/json"
};

const xmlHandler: FileFormatHandler = {
  validate: (data: any) => {
    return data && (
      data.ArrayOfLocation ||
      data.ArrayOfMotionProfile ||
      data.ArrayOfGripParams ||
      data.ArrayOfSequence
    );
  },
  parse: (data: string) => {
    const result: TeachPendantData = {};
    const parsed = xml2js(data, { compact: true }) as any;

    if (parsed.ArrayOfLocation) {
      const locations = Array.isArray(parsed.ArrayOfLocation.Location) 
        ? parsed.ArrayOfLocation.Location 
        : [parsed.ArrayOfLocation.Location];
      
      result.teachPoints = locations.map((loc: any) => ({
        id: Number(loc.Index._text) || 0,
        name: loc.Name._text || "",
        coordinate: JSON.stringify({
          j1: Number(loc.Joint1._text) || 0,
          j2: Number(loc.Joint2._text) || 0,
          j3: Number(loc.Joint3._text) || 0,
          j4: Number(loc.Joint4._text) || 0,
          j5: Number(loc.Joint5._text) || 0,
          j6: Number(loc.Joint6._text) || 0,
        }),
        type: "location",
        locType: "j",
      }));
    }

    // Add handlers for other XML data types as needed
    return result;
  },
  serialize: (data: TeachPendantData) => {
    const xmlData: any = {};
    
    if (data.teachPoints) {
      xmlData.ArrayOfLocation = {
        Location: data.teachPoints.map(point => {
          let coords;
          try {
            coords = typeof point.coordinate === 'string' ? JSON.parse(point.coordinate) : point.coordinate;
          } catch (e) {
            coords = { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };
          }
          return {
            Name: { _text: point.name },
            Index: { _text: point.id.toString() },
            ZClearance: { _text: "0" },
            VerticalOffset: { _text: "false" },
            Joint1: { _text: coords.j1.toString() },
            Joint2: { _text: coords.j2.toString() },
            Joint3: { _text: coords.j3.toString() },
            Joint4: { _text: coords.j4.toString() },
            Joint5: { _text: coords.j5.toString() },
            Joint6: { _text: coords.j6.toString() },
            Joint7: { _text: "0" },
          };
        })
      };
    }

    // Add handlers for other data types as needed
    return js2xml({ _declaration: { _attributes: { version: "1.0" } }, ...xmlData }, { compact: true, spaces: 2 });
  },
  fileExtension: ".xml",
  mimeType: "application/xml"
};

export const fileFormatHandlers: Record<string, FileFormatHandler> = {
  json: jsonHandler,
  xml: xmlHandler,
};

export const detectFileFormat = (fileName: string): FileFormatHandler => {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'xml':
      return xmlHandler;
    case 'json':
    default:
      return jsonHandler;
  }
};

export const downloadFile = (data: string, fileName: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 