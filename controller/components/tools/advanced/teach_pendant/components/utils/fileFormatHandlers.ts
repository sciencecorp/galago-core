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
    console.log('XML Validation - Input data:', data);
    // Check if data is in the wrapped format
    const isWrappedValid = data && (
      Array.isArray(data.teachPoints) ||
      Array.isArray(data.motionProfiles) ||
      Array.isArray(data.sequences) ||
      Array.isArray(data.gripParams)
    );

    // Check if data is in the unwrapped format
    const isUnwrappedValid = data && (
      data.ArrayOfLocation ||
      data.ArrayOfMotionProfile ||
      data.ArrayOfGripParams ||
      data.ArrayOfSequence ||
      data.TeachPendantData?.ArrayOfLocation ||
      data.TeachPendantData?.ArrayOfMotionProfile ||
      data.TeachPendantData?.ArrayOfGripParams ||
      data.TeachPendantData?.ArrayOfSequence
    );

    const isValid = isWrappedValid || isUnwrappedValid;
    console.log('XML Validation result:', isValid);
    return isValid;
  },
  parse: (data: string) => {
    console.log('XML Parse - Raw input:', data);
    const result: TeachPendantData = {};

    // Wrap multiple root nodes in a single parent node if needed
    const xmlData = data.trim();
    const wrappedXml = xmlData.startsWith('<?xml')
      ? xmlData.replace(/^<\?xml[^>]*>\s*/, '<?xml version="1.0"?>\n<TeachPendantData>')
      : '<?xml version="1.0"?>\n<TeachPendantData>' + xmlData;
    const wrappedData = wrappedXml + (wrappedXml.includes('</TeachPendantData>') ? '' : '</TeachPendantData>');

    const parsed = xml2js(wrappedData, { compact: true }) as any;
    console.log('XML Parse - After xml2js:', parsed);

    // Parse PreciseArm sequences
    if (parsed.TeachPendantData?.ArrayOfSequence?.Sequence) {
      console.log('Found sequences:', parsed.TeachPendantData.ArrayOfSequence.Sequence);
      const sequences = Array.isArray(parsed.TeachPendantData.ArrayOfSequence.Sequence) 
        ? parsed.TeachPendantData.ArrayOfSequence.Sequence 
        : [parsed.TeachPendantData.ArrayOfSequence.Sequence];
      console.log('Normalized sequences array:', sequences);

      result.sequences = sequences.map((seq: any) => {
        console.log('Processing sequence:', seq);
        const commands = Array.isArray(seq.Commands.RobotCommand)
          ? seq.Commands.RobotCommand
          : [seq.Commands.RobotCommand];
        console.log('Sequence commands:', commands);

        return {
          name: seq.Name?._text || seq.Name || seq.n?._text || '',
          description: "",
          commands: commands.map((cmd: any, index: number) => {
            console.log('Processing command:', cmd);
            const commandType = cmd._attributes?.xsi_type || cmd._attributes?.["xsi:type"] || "";
            console.log('Command type:', commandType);
            let command = "";
            let params: Record<string, any> = {};

            switch (commandType) {
              case "MoveCommand":
                command = "move";
                params = {
                  waypoint: cmd.LocationName?._text || cmd.LocationName || '',
                  motion_profile_id: 1
                };
                break;
              case "PickPlateCommand":
                command = "grasp_plate";
                params = {
                  width: Number(cmd.GripWidth?._text) || 130,
                  force: 15,
                  speed: 10
                };
                break;
              case "PlacePlateCommand":
                command = "release_plate";
                params = {
                  width: Number(cmd.GripWidth?._text) || 130,
                  speed: 10
                };
                break;
              default:
                console.warn('Unknown command type:', commandType);
            }
            console.log('Processed command:', { command, params });

            return {
              command,
              params,
              order: index
            };
          })
        };
      });
      console.log('Final sequences:', result.sequences);
    }

    // Parse locations
    if (parsed.TeachPendantData?.ArrayOfLocation) {
      console.log('Found locations:', parsed.TeachPendantData.ArrayOfLocation);
      const locations = Array.isArray(parsed.TeachPendantData.ArrayOfLocation.Location) 
        ? parsed.TeachPendantData.ArrayOfLocation.Location 
        : [parsed.TeachPendantData.ArrayOfLocation.Location];
      console.log('Normalized locations array:', locations);
      
      result.teachPoints = locations.map((loc: any) => {
        const point = {
          id: Number(loc.Index?._text) || 0,
          name: loc.Name?._text || loc.n?._text || "",
          coordinate: [
            Number(loc.Joint1?._text) || 0,
            Number(loc.Joint2?._text) || 0,
            Number(loc.Joint3?._text) || 0,
            Number(loc.Joint4?._text) || 0,
            Number(loc.Joint5?._text) || 0,
            Number(loc.Joint6?._text) || 0,
          ].join(" "),
          type: "location",
          locType: "j",
        };
        return point;
      })
      // Filter out invalid locations (empty names and all zero coordinates)
      .filter((point: TeachPoint) => {
        const isValid = point.name !== "" && 
                       point.coordinate !== "0 0 0 0 0 0" &&
                       point.coordinate.split(" ").some((coord: string) => Number(coord) !== 0);
        return isValid;
      })
      // Ensure unique sequential IDs
      .map((point: TeachPoint, index: number) => ({
        ...point,
        id: index + 1
      }));

      const totalLocations = locations.length;
      const validLocations = result.teachPoints?.length || 0;
      console.log(`Processed ${validLocations} valid locations out of ${totalLocations} total locations`);
    }

    // Parse motion profiles
    if (parsed.TeachPendantData?.ArrayOfPreciseFlexMotionProfile?.PreciseFlexMotionProfile) {
      const profiles = Array.isArray(parsed.TeachPendantData.ArrayOfPreciseFlexMotionProfile.PreciseFlexMotionProfile)
        ? parsed.TeachPendantData.ArrayOfPreciseFlexMotionProfile.PreciseFlexMotionProfile
        : [parsed.TeachPendantData.ArrayOfPreciseFlexMotionProfile.PreciseFlexMotionProfile];
      
      result.motionProfiles = profiles.map((profile: any) => ({
        id: Number(profile.Id?._text) || 0,
        name: profile.Name?._text || '',
        profile_id: Number(profile.ProfileId?._text) || 1,
        speed: Number(profile.Speed?._text) || 100,
        speed2: Number(profile.Speed2?._text) || 100,
        acceleration: Number(profile.Acceleration?._text) || 100,
        deceleration: Number(profile.Deceleration?._text) || 100,
        accel_ramp: Number(profile.AccelRamp?._text) || 100,
        decel_ramp: Number(profile.DecelRamp?._text) || 100,
        inrange: Number(profile.Inrange?._text) || 1,
        straight: Number(profile.Straight?._text) || 0,
        tool_id: 1
      }));
    }

    console.log('Final parsed result:', result);
    return result;
  },
  serialize: (data: TeachPendantData) => {
    const xmlData: any = {
      _declaration: { _attributes: { version: "1.0" } },
      TeachPendantData: {}
    };
    
    if (data.teachPoints) {
      xmlData.TeachPendantData.ArrayOfLocation = {
        Location: data.teachPoints.map(point => {
          const coords = point.coordinate.split(" ").map(Number);
          return {
            Name: { _text: point.name },
            Index: { _text: point.id.toString() },
            ZClearance: { _text: "0" },
            VerticalOffset: { _text: "false" },
            Joint1: { _text: coords[0].toString() },
            Joint2: { _text: coords[1].toString() },
            Joint3: { _text: coords[2].toString() },
            Joint4: { _text: coords[3].toString() },
            Joint5: { _text: coords[4].toString() },
            Joint6: { _text: coords[5].toString() },
            Joint7: { _text: "0" },
          };
        })
      };
    }

    if (data.sequences) {
      xmlData.TeachPendantData.ArrayOfSequence = {
        Sequence: data.sequences.map(seq => ({
          _attributes: {
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xmlns:xsd": "http://www.w3.org/2001/XMLSchema"
          },
          Name: { _text: seq.name },
          Commands: {
            RobotCommand: seq.commands.map(cmd => {
              const base = {
                _attributes: {},
                Name: { _text: cmd.command }
              };

              switch (cmd.command) {
                case "move":
                  return {
                    ...base,
                    _attributes: {
                      "xsi:type": "MoveCommand"
                    },
                    LocationName: { _text: cmd.params.waypoint },
                    ProfileName: { _text: "Default" },
                    BlendOverwrite: { _text: "false" },
                    StraightOverwrite: { _text: "false" }
                  };
                case "grasp_plate":
                  return {
                    ...base,
                    _attributes: {
                      "xsi:type": "PickPlateCommand"
                    },
                    GripWidth: { _text: cmd.params.width?.toString() || "130" }
                  };
                case "release_plate":
                  return {
                    ...base,
                    _attributes: {
                      "xsi:type": "PlacePlateCommand"
                    },
                    GripWidth: { _text: cmd.params.width?.toString() || "130" }
                  };
                default:
                  return base;
              }
            })
          }
        }))
      };
    }

    if (data.motionProfiles) {
      xmlData.TeachPendantData.ArrayOfPreciseFlexMotionProfile = {
        PreciseFlexMotionProfile: data.motionProfiles.map(profile => ({
          Id: { _text: profile.id.toString() },
          Name: { _text: profile.name },
          ProfileId: { _text: profile.profile_id.toString() },
          Speed: { _text: profile.speed.toString() },
          Speed2: { _text: profile.speed2.toString() },
          Acceleration: { _text: profile.acceleration.toString() },
          Deceleration: { _text: profile.deceleration.toString() },
          AccelRamp: { _text: profile.accel_ramp.toString() },
          DecelRamp: { _text: profile.decel_ramp.toString() },
          Inrange: { _text: profile.inrange.toString() },
          Straight: { _text: profile.straight.toString() }
        }))
      };
    }

    return js2xml(xmlData, { compact: true, spaces: 2 });
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