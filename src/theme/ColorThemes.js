const light = {
  name: "light",
  statusbar: "dark-content",
  keyboardAppearance: "light",
  elevation: 6,
  colors: {
    primary: "#f3bc56",
    onPrimary: "#FFFFFF",

    secondary: "#3b3b3b",
    onSecondary: "#FFFFFF",

    background: "#FFFFFF",
    onBackground: "#000000",

    surface: "#f5f5f5",
    onSurface: "#000000",

    surfaceSecondary: "#fefefe",

    font: "#000000",
    error: "#FF0000",
  },
};

const dark = {
  name: "dark",
  statusbar: "light-content",
  keyboardAppearance: "dark",
  elevation: 0,
  colors: {
    // primary: "#a4fc86",
    primary: "#61d763",
    onPrimary: "#FFFFFF",

    secondary: "#FFFFFF",
    onSecondary: "#000000",

    background: "#000000",
    onBackground: "#FFFFFF",

    surface: "#1a1a1a",
    onSurface: "#FFFFFF",

    surfaceSecondary: "#282828",

    font: "#FFFFFF",
    error: "#ff6161",
  },
};

const midnight = {
  name: "midnight",
  statusbar: "light-content",
  elevation: 0,
  colors: {
    primary: "#0d1847",
    onPrimary: "#FFFFFF",
    onPrimarySelected: "#50d1e0",

    background: "#000000",
    onBackground: "#FFFFFF",

    surface: "#121212",
    onSurface: "#FFFFFF",

    font: "#FFFFFF",
    error: "#FF4E2C",
  },
};

const navy = {
  name: "navy",
  statusbar: "light-content",
  elevation: 0,
  colors: {
    primary: "#3658D8",
    onPrimary: "#FFFFFF",
    onPrimarySelected: "#ee0979",

    background: "#17203F",
    onBackground: "#FFFFFF",

    surface: "#1C2754",
    onSurface: "#FFFFFF",

    font: "#FFFFFF",
    error: "#FF4E2C",
  },
};

const cool = {
  name: "cool",
  statusbar: "light-content",
  elevation: 0,
  colors: {
    primary: "#8a2c00",
    onPrimary: "#FFFFFF",
    onPrimarySelected: "#c2832b",

    background: "#121212",
    onBackground: "#FFFFFF",

    surface: "#1E1E1E",
    onSurface: "#FFFFFF",

    font: "#FFFFFF",
    error: "#FF4E2C",
  },
};

const sea = {
  name: "sea",
  statusbar: "light-content",
  elevation: 0,
  colors: {
    primary: "#F25757",
    onPrimary: "#FFFFFF",
    onPrimarySelected: "#c2832b",

    background: "#EEE5BF",
    onBackground: "#001524",

    surface: "#14281D",
    onSurface: "#FFFFFF",

    font: "#FFFFFF",
    error: "#FF4E2C",
  },
};

export const Themes = { light, dark, midnight, navy, cool, sea };
