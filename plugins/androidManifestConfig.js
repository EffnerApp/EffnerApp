const { AndroidConfig, ConfigPlugin, withAndroidManifest } = require('@expo/config-plugins');

// Using helpers keeps error messages unified and helps cut down on XML format changes.
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow, getMainActivityOrThrow } = AndroidConfig.Manifest;

function addAttributesToMainActivity(androidManifest) {
  const application = getMainApplicationOrThrow(androidManifest);

  if (!Array.isArray(application["activity"])) {
    console.warn(
      "no activity array in .MainApplication?"
    );
    return androidManifest;
  }

  const activity = application["activity"].find(
    (item) => item.$["android:name"] === ".MainActivity"
  );
  if (!activity) {
    console.warn("de.effnerapp.effner.MainActivity not found");
    return androidManifest;
  }

  activity.$["android:exported"] = "true";

  console.log('set android:exported to true for MainActivity.')

  return androidManifest;
}

module.exports = function withIntentActivity(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addAttributesToMainActivity(config.modResults);
    return config;
  });
};