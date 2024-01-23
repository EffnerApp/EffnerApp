import {Dimensions, Linking, Platform} from "react-native";
import Toast from "react-native-toast-message";
import {CommonActions} from "@react-navigation/native";
import {startActivityAsync} from "expo-intent-launcher";
import * as WebBrowser from 'expo-web-browser';
import moment from "moment";
import {hash} from "./hash";
import * as Device from 'expo-device';
import {DeviceType} from "expo-device";

import _ from 'lodash';
import {load, save} from "./storage";
// _ is 'low-dash' for the cool kids, and I'm definitely a cool kid ^^
// ~ sebi, 02.04.2022

let deviceType = DeviceType.UNKNOWN;

const initDevice = async () => {
    deviceType = await Device.getDeviceTypeAsync();
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

const saveAndLoadClass = (navigation, c, next = null) => {
    load("APP_CLASS").then(currentClass => {
        save('APP_CLASS', c)
            .then(() => {
                saveRecentClass(c, currentClass)
                    .catch(err => console.log(err))
                    .finally(() => navigateTo(navigation, 'Splash', {nextScreen: next}))
            })
            .catch(({message, response}) => showToast('Error while performing class change.', response?.data?.status?.error || message, 'error'));
    }).catch(console.log)
}

const saveRecentClass = (newClass, oldClass) => {
    return new Promise((resolve, reject) => {
        load("RECENT_CLASSES").then(recent => {
            if (! recent) {
                recent = [oldClass]
            }

            if (recent.includes(newClass))
                recent = recent.filter(x => x !== newClass)

            recent.push(newClass)

            console.log("saving recent_classes -> " + recent)

            // save the recent class
            save("RECENT_CLASSES", recent).then(() => resolve()).catch(err => reject(err))
        }).catch(err => reject(err))
    })
}

const clearRecentClasses = async () => {
    return await save("RECENT_CLASSES", null);
}

const getPlatform = () => {
    return Platform.OS;
}

const runsOn = (os) => {
    return Platform.OS === os;
}

const getLevel = (sClass) => {
    return sClass.match(/^\d{1,2}/)[0];
};

const isALevel = (sClass) => {
    return ['11', '12'].includes(getLevel(sClass));
}

const validateClass = (selectedClass, comparingAgainst) => {
    if (selectedClass === comparingAgainst)
        return true;

    // TODO Completely rewrite this when we switch sub plan provider

    // Selected class follows this pattern:
    // 10[A-I]
    // 12Q[1-6]

    // comparingAgainst follows this pattern:
    // 10[A-F]
    // 10[A-F][F|S|L]
    // 12Q

    // all cases to handle:
    // sC = ""; cA = ""
    // sC = ""; cA = ""
    // sC = ""; cA = ""
    // sC = ""; cA = ""
    // sC = ""; cA = ""

    // boring fix for 12Q-"broadcasts"
    if (comparingAgainst.endsWith("Q")) {
        return selectedClass.includes(comparingAgainst);
    }

    // regex check for classes with FSL (French, Spanish, Latin)
    const filterMatches = comparingAgainst.match(/(\d{1,2}[A-Z])[FSL]/);
    if (filterMatches) {
        const classGroup = filterMatches[1];
        return classGroup === selectedClass;
    }

    return false;
};

const openUri = async (uri, options = {}) => {
    if (uri.startsWith('mailto:')) {
        await Linking.openURL(uri);
    } else if ((uri.endsWith('.pdf') || options.type === 'pdf') && runsOn('android')) {
        // open PDFs with the action view handler on android (fixes issue #163: https://github.com/EffnerAppArchive/effnerapp-web-legacy/issues/163)
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

// turns a day in int format into a german day name abkürzung.
// 0 equals Sunday, 1 - 6 equal Monday till Friday.
const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const getWeekDay = (i) => {
    return weekDays[i];
}

const fullWeekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const getFullWeekDay = (i) => {
    return fullWeekDays[i];
}

const excludeScreens = (route, screensToExclude) => screensToExclude.includes(route.name) ? () => null : undefined

function getUpcomingExams(exams) {
    let _exams = exams.filter((exam) => moment(exam.date2 || exam.date, 'DD.MM.YYYY').set({hour: 14, minute: 0}) > moment()).slice().sort((a, b) => {
        return moment(a.date2 || a.date, 'DD.MM.YYYY').unix() - moment(b.date2 || b.date, 'DD.MM.YYYY').unix();
    });

    _exams = _exams.map((exam) => {
        if (_exams.filter(value => value.name === exam.name).length > 1) {
            return {
                ...exam,
                name: exam.name + (exam.course ? ' (' + exam.course + ')' : '')
            };
        }
        return exam;
    });
    const grouped = groupBy(_exams, item => item.date + (item.date2 ? ' - ' + item.date2 : ''));
    return Array.from(grouped);
}

function getExamsHistory(exams) {
    let _exams = exams.filter((exam) => moment(exam.date2 || exam.date, 'DD.MM.YYYY').set({hour: 14, minute: 0}) <= moment()).slice().sort((a, b) => {
        return moment(b.date2 || b.date, 'DD.MM.YYYY').unix() - moment(a.date2 || a.date, 'DD.MM.YYYY').unix();
    });

    _exams.map((exam) => {
        if (_exams.filter(value => value.name === exam.name).length > 1) {
            return {
                ...exam,
                name: exam.name + (exam.course ? ' (' + exam.course + ')' : '')
            };
        }
        return exam;
    });
    const grouped = groupBy(_exams, item => item.date + (item.date2 ? ' - ' + item.date2 : ''));
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
    const {width, height} = Dimensions.get('window');

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
        //scale = Math.max(scaleWidth, scaleHeight) * 0.9;
        scale = Math.max(scaleWidth, scaleHeight);
        return Math.ceil((size * scale));
    }
}

const maxTimetableDepth = (timetable) => {
    for (let j = 9; j >= 0; j--) {
        let rowEmpty = true;
        for (let i = 4; i >= 0; i--) {
            rowEmpty = !timetable?.lessons?.[i]?.[j];
            if (!rowEmpty) {
                break;
            }
        }
        if (!rowEmpty) {
            return j + 1;
        }
    }
    return 0;
};

const getSubstitutionInfo = ({period, subTeacher, room, info}) => {
    if (info === 'Raumänderung') {
        return info + ' zu Raum ' + room;
    } else if (!subTeacher || info === 'entfällt') {
        return info;
    } else if (subTeacher) {
        return ' vertreten durch ' + subTeacher + (info ? ' (' + info + ')' : '');
    }
}

const getSubstitutionTitle = ({period, subTeacher, room, info}) => {
    let s = period + '. Stunde';

    if (info === 'Raumänderung') {
        s += ': ' + info + ' zu Raum ' + room;
    } else if (!subTeacher || info === 'entfällt') {
        s += ': ' + info;
    } else if (subTeacher) {
        s += ' vertreten durch ' + subTeacher;
    }

    return s;
};

const clamp = (value, min, max) => value > max ? max : value < min ? min : value;

const pad = (num, size) => {
    num = num.toString();
    while (num.length < size) num = '0' + num;
    return num;
};

const clone = (object) => _.cloneDeep(object);

const getSubjectName = (subjects, subject) => {
    // why tf is it called className????
    return (
        subjects.find(({alias}) =>
            alias.find(a => a.toLowerCase() === subject.toLowerCase())
        )?.className || subject
    );
};

const withAlpha = (color, opacity) => {
    // coerce values so ti is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
};

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
    normalize,
    maxTimetableDepth,
    getSubstitutionTitle,
    getSubstitutionInfo,
    clamp,
    pad,
    clone,
    getSubjectName,
    getFullWeekDay,
    withAlpha,
    saveAndLoadClass,
    clearRecentClasses
}
