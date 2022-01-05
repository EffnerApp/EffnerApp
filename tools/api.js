import axios from "axios";
import DSBMobile from "./dsbmobile";
import {hash} from "./hash";

const BASE_URL = "https://api.popquiz.sebi.me/v1";
const STATIC_URL = "https://static.popquiz.sebi.me";
const SOCKET_URL = "wss://realtime.popquiz.sebi.me";

let lastFetchTime = 0;
//export const SOCKET_URL = "ws://192.168.178.35:80";

const loadData = async (credentials, sClass) => {
    console.log('Loading data ...');
    lastFetchTime = new Date().getTime();
    const time = Date.now();

    try {
        const response = await axios.get('https://api.effner.app/v2/data?class=' + sClass, {
            headers: {
                'Authorization': 'Basic ' + hash(credentials + ':' + time),
                'X-Time': time
            }
        });

        return response.data.data;
    } catch (e) {
        // TODO: crashlytics
        // await FirebaseCrashlytics.recordException({message: e.message, stacktrace: e.stack});
        return Promise.reject(e.response?.data?.status?.error || e);
    }
}

const loadDSBTimetable = async (credentials) => {
    const creds = credentials.split(':');
    const dsbmobile = new DSBMobile(creds[0], creds[1]);

    try {
        await dsbmobile.login();
        return await dsbmobile.getTimetable();
        // store.commit('setSubstitutions', timetable);
    } catch (e) {
        // await FirebaseCrashlytics.recordException({message: e.message, stacktrace: e.stack});
        console.error(e);
    }
}

const loadNews = async () => {
    try {
        // get news from effner.de website
        const news = await axios.get('https://effner.de/wp-json/wp/v2/posts');

        return news.data;
    } catch (e) {
        // await FirebaseCrashlytics.recordException({message: e.message, stacktrace: e.stack});
        console.error(e);
    }
}

export {loadData, loadNews, loadDSBTimetable}
