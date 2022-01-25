import AsyncStorage from "@react-native-async-storage/async-storage";
import {Platform} from "react-native";
import Toast from "react-native-toast-message";
import {CommonActions} from "@react-navigation/native";
import {startActivityAsync} from "expo-intent-launcher";
import * as WebBrowser from 'expo-web-browser';
import moment from "moment";
import {hash} from "./hash";
// import { BASE_URL } from "./api";
// import queryString from "query-string";
// import { CommonActions } from "@react-navigation/routers";
// import Toast from "react-native-root-toast";


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
    return sClass.match('^\\d{1,2}')[0];
};

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

export {
    showToast,
    navigateTo,
    getPlatform,
    runsOn,
    getLevel,
    validateClass,
    openUri,
    groupBy,
    decodeEntities,
    getWeekDay,
    excludeScreens,
    getUpcomingExams,
    getExamsHistory,
    fromAngle,
    withAuthentication
}
