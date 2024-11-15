const runTypeColors: { [key: string]: string } = {
  default: "green",
  plate_transfer: "green",
  imaging: "green",
  incubation: "green",
  // Add more run types and their corresponding colors here
};

export function getColorForRunType(runType: string): string {
  return runTypeColors[runType] || runTypeColors.default;
}

const instrumentColors: { [key: string]: string } = {
  pf400: "purple.500",
  cytation: "purple.500",
  liconic: "purple.500",
  hamilton: "purple.500",
  ot2: "purple.500",
  bravo: "purple.500",
  vcode: "purple.500",
  toolbox: "purple.500",
  // Add more instruments and their corresponding colors here
};

export function getColorForInstrument(instrument: string): string {
  return instrumentColors[instrument.toLowerCase()] || "gray";
}
