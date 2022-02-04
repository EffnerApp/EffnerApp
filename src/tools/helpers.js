import {Dimensions, Platform} from "react-native";
import Toast from "react-native-toast-message";
import {CommonActions} from "@react-navigation/native";
import {startActivityAsync} from "expo-intent-launcher";
import * as WebBrowser from 'expo-web-browser';
import moment from "moment";
import {hash} from "./hash";
import * as Device from 'expo-device';
import {DeviceType} from "expo-device";

let deviceType = DeviceType.UNKNOWN;

const initDevice = async () => {
    deviceType = await Device.getDeviceTypeAsync();
    console.log('deviceType -> ' + deviceType);
}

const showToast = (title, message, type = 'success') => {
    Toast.show({
        type,
        text1: title,
        text2: message
    });
}

const navigateTo = (navigation, to, params = {}) => {
    navigation.dispatch(CommonActions.reset({
        index: 0,
        routes: [{name: to, params}]
    }));
}

const getPlatform = () => {
    return Platform.OS;
}

const runsOn = (os) => {
    return Platform.OS === os;
}


// const getLevel = async () => {
// 	return (await load('APP_CLASS')).match('^\\d{1,2}')[0];
// };

const getLevel = (sClass) => {
    return sClass.match(/^\d{1,2}/)[0];
};

const isALevel = (sClass) => {
    return ['11', '12'].includes(getLevel(sClass));
}

const validateClass = (fullClass, test) => {
    if (fullClass === test)
        return true;

    // if the test string is not equal to the full class name we test it using regex for these cases:
    // fullClass="12Q3"; test="12Q" -> match
    // fullClass="10E"; test="12EF" -> match


    const checkA = fullClass.match(/\d{1,2}[A-Z]/);
    const checkB = test.match(/\d{1,2}[A-Z]/);

    let result = false;

    if (checkA) {
        result = checkA[0] === test;
    } else if (checkB) {
        result = checkB[0] === fullClass;
    }

    return result;
};

const openUri = async (uri, options = {}) => {
    // open PDFs with the action view handler on android (fixes issue #163: https://github.com/EffnerApp/EffnerApp/issues/163)
    if ((uri.endsWith('.pdf') || options.type === 'pdf') && runsOn('android')) {
        await startActivityAsync('android.intent.action.VIEW', {
            data: uri,
            flags: 1,
            type: 'application/pdf'
        });
    } else {
        await WebBrowser.openBrowserAsync(uri);
    }
}

const groupBy = (list, keyGetter) => {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
};

const decodeEntities = (encodedString) => {
    const translate_re = /&(nbsp|amp|quot|lt|gt|auml|Auml|ouml|Ouml|uuml|Uuml|szlig);/g;
    const translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">",
        "auml": "ä",
        "Auml": "Ä",
        "ouml": "ö",
        "Ouml": "Ö",
        "uuml": "ü",
        "Uuml": "Ü",
        "szlig": "ß",

    };
    return encodedString.replace(translate_re, function (match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function (match, numStr) {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
};

const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const getWeekDay = (i) => {
    return weekDays[i];
}

const excludeScreens = (route, screensToExclude) => screensToExclude.includes(route.name) ? () => null : undefined

function getUpcomingExams(exams) {
    const _exams = exams.filter((exam) => moment(exam.date, 'DD.MM.YYYY') >= moment()).slice().sort((a, b) => {
        return moment(a.date, 'DD.MM.YYYY').unix() - moment(b.date, 'DD.MM.YYYY').unix();
    }).map((exam) => {
        if (exams.filter(value => value.name === exam.name).length > 1) {
            return {
                ...exam,
                name: exam.name + (exam.course ? ' (' + exam.course + ')' : '')
            };
        }
        return exam;
    });
    const grouped = groupBy(_exams, item => item.date);
    return Array.from(grouped);
}

function getExamsHistory(exams) {
    const _exams = exams.filter((exam) => moment(exam.date, 'DD.MM.YYYY') < moment()).slice().sort((a, b) => {
        return moment(a.date, 'DD.MM.YYYY').unix() - moment(b.date, 'DD.MM.YYYY').unix();
    }).map((exam) => {
        if (exams.filter(value => value.name === exam.name).length > 1) {
            return {
                ...exam,
                name: exam.name + (exam.course ? ' (' + exam.course + ')' : '')
            };
        }
        return exam;
    });
    const grouped = groupBy(_exams, item => item.date);
    return Array.from(grouped);
}

const getCurrentSubstitutionDay = (dates) => {
    const now = new Date();
    const hour = now.getHours();

    let newDate;

    if (hour >= 14 || dates[0] !== moment(now).format('DD.MM.YYYY')) {
        if (dates.length >= 2) {
            newDate = dates[1];
        } else {
            newDate = dates[0];
        }
    } else {
        newDate = dates[0];
    }

    return newDate;
};

// get pX and pY from angle (inverse atan2)
function fromAngle(angle, len = 1) {
    const theta = angle / 2 * Math.PI / 180;
    const pX = len * Math.cos(theta);
    const pY = len * Math.sin(theta);

    return [pX, pY];
}

const withAuthentication = (credentials) => {
    const time = Date.now();

    return {
        headers: {
            'Authorization': 'Basic ' + hash(credentials + ':' + time),
            'X-Time': time.toString()
        }
    };
}

// very hacky function, it'll work. trust me :)
const normalize = (size, sizeXL) => {
    const { width, height } = Dimensions.get('window');

    // Use Google Pixel 4a as base size
    const baseWidth = 393;
    const baseHeight = 785;

    const scaleWidth = width / baseWidth;
    const scaleHeight = height / baseHeight;

    let scale;

    if (deviceType === DeviceType.TABLET) {
        scale = Math.min(scaleWidth, scaleHeight) * 0.75;
        return Math.ceil(((sizeXL || size) * scale));
    } else {
        scale = Math.max(scaleWidth, scaleHeight) * 0.9;
        return Math.ceil((size * scale));
    }
}

export {
    initDevice,
    showToast,
    navigateTo,
    getPlatform,
    runsOn,
    getLevel,
    isALevel,
    validateClass,
    openUri,
    groupBy,
    decodeEntities,
    getWeekDay,
    excludeScreens,
    getUpcomingExams,
    getExamsHistory,
    getCurrentSubstitutionDay,
    fromAngle,
    withAuthentication,
    normalize
}
