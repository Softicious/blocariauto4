import * as fs from 'fs';

const GMS_VERSION = '17.0.0';
const PLUGIN_PATH = './node_modules/cordova-plugin-google-analytics/plugin.xml';

console.log(`Attempting to set $GMS_VERSION = ${GMS_VERSION} in ${PLUGIN_PATH}`);

const pluginContents = fs.readFileSync(PLUGIN_PATH).toString('utf8');
const pluginContentsUpdated = pluginContents.replace('$GMS_VERSION', GMS_VERSION);

fs.writeFileSync(PLUGIN_PATH, pluginContentsUpdated);

console.log('Success!');