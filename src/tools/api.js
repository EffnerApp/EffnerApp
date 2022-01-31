import axios from "axios";
import DSBMobile from "./dsbmobile";
import {hash} from "./hash";
import {showToast} from "./helpers";
import {save, load} from "./storage";
import {BASE_URL} from "./resources";
import {subscribeToChannel} from "./push";

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

const loadDSBTimetable = async (credentials) => {
    const [id, password] = credentials.split(':');
    const dsbmobile = new DSBMobile(id, password);

    try {
        await dsbmobile.login();
        return await dsbmobile.getTimetable();
    } catch (e) {
        // await FirebaseCrashlytics.recordException({message: e.message, stacktrace: e.stack});
        console.error(e);
    }
}

export {login, loadClasses, loadDSBTimetable};
