const getSubjectColorFromMeta = ({meta, subject}) => meta.find((e) => e.subject === subject)?.color || 'transparent';

const themeColors = {
    'Kunterbunt': getSubjectColorFromMeta,
    'Schwarz/Weiß': 'transparent',
    'Gelb': '#ebc334',
    'Grün': '#34eb52',
    'Blau': '#349eeb',
    'Türkis': '#00bf99',
    'Rot': '#e85b5b'
}

const getTimetableThemes = () => Object.keys(themeColors);

const getCellColor = (theme, options) => {
    const keys = getTimetableThemes();
    const entry = themeColors[keys[theme]];

    if(!entry) {
        return 'transparent';
    }

    if(entry instanceof Function) {
        return entry(options);
    } else {
        return entry;
    }
}

export {themeColors, getSubjectColorFromMeta, getTimetableThemes, getCellColor}
