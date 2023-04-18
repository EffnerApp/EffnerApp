const {
  withProjectBuildGradle,
  withPlugins,
} = require('@expo/config-plugins');

function setMinSdkVersion(buildGradle, targetVersion) {
  const regexpCurrentVersion = /\bminSdkVersion\s*=\s*(\d+)/;
  const match = buildGradle.match(regexpCurrentVersion);

  if (match) {
    const version = parseInt(match[1], 10);

    if (version < targetVersion) {
      buildGradle = buildGradle.replace(
        /\bminSdkVersion\s*=\s*\d+/,
        `minSdkVersion = ${targetVersion}`
      );
    } else {
      console.warn(`WARN: minSdkVersion is already >= ${version}`);
    }
  }

  return buildGradle;
}

function setCompileSdkVersion(buildGradle, targetVersion) {
  const regexpCurrentVersion = /\bcompileSdkVersion\s*=\s*(\d+)/;
  const match = buildGradle.match(regexpCurrentVersion);

  if (match) {
    const version = parseInt(match[1], 10);

    if (version < targetVersion) {
      buildGradle = buildGradle.replace(
        /\bcompileSdkVersion\s*=\s*\d+/,
        `compileSdkVersion = ${targetVersion}`
      );
    } else {
      console.warn(`WARN: compileSdkVersion is already >= ${version}`);
    }
  }

  return buildGradle;
}

function setTargetSdkVersion(buildGradle, targetVersion) {
  const regexpCurrentVersion = /\btargetSdkVersion\s*=\s*(\d+)/;
  const match = buildGradle.match(regexpCurrentVersion);

  if (match) {
    const version = parseInt(match[1], 10);

    if (version < targetVersion) {
      buildGradle = buildGradle.replace(
        /\btargetSdkVersion\s*=\s*\d+/,
        `targetSdkVersion = ${targetVersion}`
      );
    } else {
      console.warn(`WARN: targetSdkVersion is already >= ${version}`);
    }
  }

  return buildGradle;
}

const withAndroidSdkVersions = (config, {
  minSdkVersion,
  compileSdkVersion,
  targetSdkVersion
} = {}) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy')
      throw new Error("Can't use withAndroidSdkVersions EAS Plugin as build.gradle is not groovy");

    if (minSdkVersion)
      config.modResults.contents = setMinSdkVersion(config.modResults.contents, minSdkVersion);
    if (compileSdkVersion)
      config.modResults.contents = setCompileSdkVersion(config.modResults.contents, compileSdkVersion);
    if (targetSdkVersion)
      config.modResults.contents = setTargetSdkVersion(config.modResults.contents, targetSdkVersion);

    return config;
  });
};

module.exports = (config, props) =>
  withPlugins(config, [
    [withAndroidSdkVersions, props],
  ]
);