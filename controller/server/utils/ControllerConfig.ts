import fs from "fs";
import minimist from "minimist";

import * as controller_protos from "gen-interfaces/controller";

const env_config = process.env.CONTROLLER_CONFIG;

const argv = minimist(process.argv.slice(2), {
  string: "config",
});

const config_path = argv.config || env_config;

if (!config_path) {
  console.error("Please provide a config file");
  //process.exit(1);
}

let ControllerConfig = {} as controller_protos.WorkcellConfig;

if (fs.existsSync(config_path)) {
  let config_text = fs.readFileSync(config_path, "utf8");
  ControllerConfig = controller_protos.WorkcellConfig.fromJSON(JSON.parse(config_text));
}

export default ControllerConfig;
