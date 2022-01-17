import axios from "axios";
import DSBMobile from "./dsbmobile";
import {hash} from "./hash";
import {load, save, showToast} from "./helpers";

// const BASE_URL = "https://api.effner.app";
const BASE_URL = "http://192.168.178.35:8080";

let lastFetchTime = 0;

const login = async (credentials, sClass) => {
    console.log('login with ' + credentials)
    console.log('class ' + sClass)
    const time = Date.now();

    try {
        const response = await axios.post(`${BASE_URL}/v3/auth/login`, {}, {
            headers: {
                'Authorization': 'Basic ' + hash(credentials + ':' + time),
                'X-Time': time
            }
        });

        if (response.data.status.login) {
            await save('APP_CREDENTIALS', credentials);
            await save('APP_CLASS', sClass);

            const pushToken = await load('pushToken');

            // subscribe to push notifications
            if(pushToken) {
                await subscribeToChannel(credentials, 'PUSH_GLOBAL', pushToken)
                    .catch(({message, response}) => showToast('Error while registering for push notifications.', response?.data?.status?.error || message, 'error'));
                await subscribeToChannel(credentials, `PUSH_CLASS_${sClass}`, pushToken)
                    .then(() => save('APP_NOTIFICATIONS', true))
                    .catch(({message, response}) => {
                        save('APP_NOTIFICATIONS', false);
                        showToast('Error while registering for push notifications.', response?.data?.status?.error || message, 'error');
                    });
            }

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
        const response = await axios.get(`${BASE_URL}/v3/classes`);

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
        const response = await axios.get(`${BASE_URL}/v3/data/${sClass}`, {
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

const withAuthentication = (credentials) => {
    const time = Date.now();

    return {
        headers: {
            'Authorization': 'Basic ' + hash(credentials + ':' + time),
            'X-Time': time.toString()
        }
    };
}

const subscribeToChannel = async (credentials, channelId, pushToken) => {
    await axios.post(
        `${BASE_URL}/v3/push/subscribe/${channelId}`,
        {
            pushToken,
        },
        withAuthentication(credentials)
    );
};

const revokePushToken = async (credentials, pushToken) => {
    await axios.post(
        `${BASE_URL}/v3/push/revokeToken`,
        {
            pushToken,
        },
        withAuthentication(credentials)
    );
};

export {login, loadClasses, loadData, loadNews, loadDSBTimetable, withAuthentication, subscribeToChannel, revokePushToken, BASE_URL};
