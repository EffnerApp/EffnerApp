import AsyncStorage from "@react-native-async-storage/async-storage";
// import {Storage} from '@capacitor/storage';
// import {showToast} from "./helpers";
// import {subscribeToChannel} from "./push";

const save = async (key, value) => {
    if (!value) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
};

const load = async (key) => {
    const data = await AsyncStorage.getItem(key);
    if (!data) return;

    return JSON.parse(data);
};

const clear = async () => {
    await AsyncStorage.clear();
}

// const searchLegacyStorageGroup = async () => {
//     const credentials = await Storage.get({key: 'APP_CREDENTIALS'});
//     const sClass = await Storage.get({key: 'APP_USER_CLASS'});
//
//     // subscribe automatically to notifications
//     const pushToken = await load('pushToken');
//
//     if(pushToken) {
//         await subscribeToChannel(credentials, 'PUSH_GLOBAL', pushToken)
//             .catch(({message, response}) => showToast('Error while registering for push notifications.', response?.data?.status?.error || message, 'error'));
//         await subscribeToChannel(credentials, `PUSH_CLASS_${sClass}`, pushToken)
//             .then(() => save('APP_NOTIFICATIONS', true))
//             .catch(({message, response}) => {
//                 save('APP_NOTIFICATIONS', false);
//                 showToast('Error while registering for push notifications.', response?.data?.status?.error || message, 'error');
//             });
//     }
// }

export {save, load, clear}
