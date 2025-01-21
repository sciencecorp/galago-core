import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types";
import { xml2js, js2xml } from "xml-js";

export interface TeachPendantData {
  teachPoints?: TeachPoint[];
  motionProfiles?: MotionProfile[];
  gripParams?: GripParams[];
  sequences?: Sequence[];
  duplicates?: {
    identical: TeachPoint[];
    different: TeachPoint[];
    originals: TeachPoint[];
  };
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
    // Get the actual data object, handling both wrapped and unwrapped formats
    const actualData = data?.TeachPendantData?.TeachPendantData || data?.TeachPendantData || data;
    console.log('XML Validation - Actual data:', actualData);

    // Check if data is in the wrapped format
    const isWrappedValid = actualData && (
      Array.isArray(actualData.teachPoints) ||
      Array.isArray(actualData.motionProfiles) ||
      Array.isArray(actualData.sequences) ||
      Array.isArray(actualData.gripParams)
    );

    // Check if data is in the unwrapped format
    const isUnwrappedValid = actualData && (
      actualData.ArrayOfLocation?.Location ||
      actualData.ArrayOfPreciseFlexMotionProfile?.PreciseFlexMotionProfile ||
      actualData.ArrayOfGripParams?.GripParams ||
      actualData.ArrayOfSequence?.Sequence
    );

    const isValid = isWrappedValid || isUnwrappedValid;
    console.log('XML Validation result:', isValid);
    return isValid;
  },
  parse: (data: string) => {
    console.log('XML Parse - Raw input:', data);
    const result: TeachPendantData = {};

    // Only wrap if not already wrapped
    const xmlData = data.trim();
    const wrappedXml = xmlData.includes('<TeachPendantData>') 
      ? xmlData 
      : `<?xml version="1.0"?>\n<TeachPendantData>${xmlData}</TeachPendantData>`;

    const parsed = xml2js(wrappedXml, { compact: true }) as any;
    console.log('XML Parse - After xml2js:', parsed);

    // Get the actual data object, handling both wrapped and unwrapped formats
    const actualData = parsed?.TeachPendantData?.TeachPendantData || parsed?.TeachPendantData || parsed;
    console.log('XML Parse - Actual data:', actualData);

    // Helper function to normalize array or single item
    const normalizeArray = (item: any) => item ? (Array.isArray(item) ? item : [item]) : [];

    // Parse PreciseArm sequences
    const sequenceData = actualData?.ArrayOfSequence?.Sequence;
    if (sequenceData) {
      console.log('Found sequences:', sequenceData);
      const sequences = normalizeArray(sequenceData);
      console.log('Normalized sequences array:', sequences);

      result.sequences = sequences.map((seq: any) => {
        console.log('Processing sequence:', seq);
        const commands = normalizeArray(seq.Commands?.RobotCommand);
        console.log('Sequence commands:', commands);

        return {
          name: seq.Name?._text || seq.n?._text || '',
          description: "",
          id: Number(seq.Id?._text) || 0,
          tool_id: 1,
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
                  waypoint: cmd.LocationName?._text || '',
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
    const locationData = actualData?.ArrayOfLocation?.Location;
    if (locationData) {
      console.log('Found locations:', locationData);
      const locations = normalizeArray(locationData);
      console.log('Normalized locations array:', locations);
      
      const processedPoints = locations.map((loc: any) => {
        const point: TeachPoint = {
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
          type: "location" as const,
          locType: "j",
        };
        return point;
      })
      .filter((point: TeachPoint) => {
        const isValid = point.name !== "" && 
                       point.coordinate !== "0 0 0 0 0 0" &&
                       point.coordinate.split(" ").some((coord: string) => Number(coord) !== 0);
        return isValid;
      });

      // Handle duplicates
      const duplicates = {
        identical: [] as TeachPoint[],
        different: [] as TeachPoint[],
        originals: [] as TeachPoint[]
      };

      result.teachPoints = processedPoints.map((point: TeachPoint, index: number) => {
        const existingPoint = (window as any).existingTeachPoints?.find((p: TeachPoint) => p.name === point.name);
        if (existingPoint) {
          if (existingPoint.coordinate === point.coordinate) {
            duplicates.identical.push(point);
            duplicates.originals.push(existingPoint);
            return { ...existingPoint };
          } else {
            duplicates.different.push(point);
            duplicates.originals.push(existingPoint);
            return { ...existingPoint };
          }
        }
        return { ...point, id: index + 1 };
      });

      result.duplicates = duplicates;

      const totalLocations = locations.length;
      const validLocations = result.teachPoints?.length || 0;
      const identicalDupes = duplicates.identical.length;
      const conflictingDupes = duplicates.different.length;
      console.log(`Processed ${validLocations} valid locations out of ${totalLocations} total locations`);
      console.log(`Found ${identicalDupes} identical duplicates and ${conflictingDupes} conflicting duplicates`);
    }

    // Parse motion profiles
    const profileData = actualData?.ArrayOfPreciseFlexMotionProfile?.PreciseFlexMotionProfile;
    if (profileData) {
      console.log('Found motion profiles:', profileData);
      const profiles = normalizeArray(profileData);
      console.log('Normalized profiles array:', profiles);
      
      result.motionProfiles = profiles.map((profile: any) => {
        // Handle both attribute-based and element-based formats
        const attrs = profile._attributes || {};
        return {
          id: Number(profile.Id?._text) || 0,
          name: attrs.Name || profile.Name?._text || profile.n?._text || '',
          profile_id: Number(profile.ProfileId?._text) || 1,
          speed: Number(attrs.Velocity || profile.Speed?._text || profile.Velocity?._text) || 100,
          speed2: Number(profile.Speed2?._text) || 100,
          acceleration: Number(attrs.Acceleration || profile.Acceleration?._text) || 100,
          deceleration: Number(attrs.Deceleration || profile.Deceleration?._text) || 100,
          accel_ramp: Number(attrs.AccelerationRamp || profile.AccelRamp?._text || profile.AccelerationRamp?._text) || 0.2,
          decel_ramp: Number(attrs.DecelerationRamp || profile.DecelRamp?._text || profile.DecelerationRamp?._text) || 0.2,
          inrange: Number(attrs.InRange || profile.Inrange?._text || profile.InRange?._text) || 1,
          straight: attrs.Straight === "true" || Number(profile.Straight?._text) === 1 ? 1 : 0,
          tool_id: 1
        };
      });
      console.log('Final motion profiles:', result.motionProfiles);
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