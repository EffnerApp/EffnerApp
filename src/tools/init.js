import {initDevice, navigateTo} from "./helpers";
import {load} from "./storage";
import {login} from "./api";
import {performStorageConversion} from "./compatibility";

export function initializeApp(navigation, nextScreen) {
    return new Promise(async (resolve, reject) => {
        await initDevice();

        const credentials = await load('APP_CREDENTIALS');
        if (credentials) {
            const sClass = await load('APP_CLASS');

            if (!sClass) {
                resolve(() => navigateTo(navigation, 'Login', {error: 'No class provided.'}));
                return;
            }

            login(credentials, sClass).then(() => {
                if (nextScreen) {
                    resolve(() => navigateTo(navigation, 'Main', {credentials, sClass, screen: nextScreen}));
                } else {
                    resolve(() => navigateTo(navigation, 'Main', {credentials, sClass}));
                }
            }).catch((e) => {
                if (e.message === 'Network Error' || e.response?.status >= 500) {
                    reject(e);
                } else {
                    resolve(() => navigateTo(navigation, 'Login', {error: e?.response?.data?.status?.error || e.message}));
                }
            });
        } else {
            try {
                await performStorageConversion();
                const credentials = await load('APP_CREDENTIALS');
                const sClass = await load('APP_CLASS');

                if (!credentials) {
                    resolve(() => navigateTo(navigation, 'Login'));
                    return;
                }

                try {
                    await login(credentials, sClass);
                    resolve(() => navigateTo(navigation, 'Main', {credentials, sClass}));
                } catch (e) {
                    resolve(() => navigateTo(navigation, 'Login', {error: e?.response?.data?.status?.error || e.message}));
                }
            } catch (e) {
                resolve(() => navigateTo(navigation, 'Login'));
            }
        }
    })
}