import axios from "axios";
import DSBMobile from "./dsbmobile";
import {hash} from "./hash";
import {save} from "./helpers";

const BASE_URL = "https://api.effner.app";

let lastFetchTime = 0;

const login = async (credentials, sClass) => {
    console.log('login with ' + credentials)
    console.log('class ' + sClass)
    const time = Date.now();

    try {
        const response = await axios.post(`${BASE_URL}/v1/auth/login`, {}, {
            headers: {
                'Authorization': 'Basic ' + hash(credentials + ':' + time),
                'X-Time': time
            }
        });

        if (response.data.status.login) {
            await save('APP_CREDENTIALS', credentials);
            await save('APP_CLASS', sClass);

            // TODO: subscribe to push notifications

            return Promise.resolve();
        } else {
            return Promise.reject(response?.data?.status?.error)
        }
    } catch (e) {
        return Promise.reject(e.response?.data?.status?.error || e)
    }


}

const loadClasses = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/v2.1/data/classes`);

        return response.data;
    } catch (e) {
        // TODO: crashlytics
        // await FirebaseCrashlytics.recordException({message: e.message, stacktrace: e.stack});
        return Promise.reject(e.response?.data?.status?.error || e);
    }
}



const loadData = async (credentials, sClass) => {
    console.log('Loading data ...');
    console.log('data with ' + credentials + ' and ' + sClass)
    lastFetchTime = new Date().getTime();
    const time = Date.now();

    try {
        const response = await axios.get(`${BASE_URL}/v2/data?class=${sClass}`, {
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

export {login, loadClasses, loadData, loadNews, loadDSBTimetable}
