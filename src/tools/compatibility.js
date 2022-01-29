import {Platform} from "react-native";

import UserDefaults from 'react-native-user-defaults';
import SharedPreferences from 'react-native-shared-preferences';

import {save} from "./storage";

const performStorageConversion = async () => {
    if (Platform.OS === 'ios') {
        // the legacy web app used the storage plugin from capacitorjs which stored the key/value pairs under the 'CapacitorStorage' group (see: https://capacitorjs.com/docs/apis/storage#configureoptions)
        // for the ios implementation, this group is simply a prefix of the actual storage key (see: https://github.com/ionic-team/capacitor-plugins/blob/main/storage/ios/Plugin/Storage.swift#L27)
        // so we try to read the values for the credentials and user class keys from the legacy storage (legacy key reference: https://github.com/EffnerApp/EffnerApp/blob/master/src/tools/storage.ts#L6)
        const credentials = await UserDefaults.get('CapacitorStorage.APP_CREDENTIALS');
        const sClass = await UserDefaults.get('CapacitorStorage.APP_USER_CLASS');

        if (credentials && sClass) {
            // save the values to the new storage
            await save('APP_CREDENTIALS', credentials);
            await save('APP_CLASS', sClass);
            return Promise.resolve();
        } else {
            return Promise.reject('[ios] Legacy storage is empty ...');
        }

    } else if (Platform.OS === 'android') {
        // the android implementation of the capacitor storage just sets 'CapacitorStorage' as group name of the SharedPreferences (see: https://github.com/ionic-team/capacitor-plugins/blob/main/storage/android/src/main/java/com/capacitorjs/plugins/storage/Storage.java#L17)
        SharedPreferences.setName('CapacitorStorage');

        return new Promise((resolve, reject) => {
            SharedPreferences.getItems(['APP_CREDENTIALS', 'APP_USER_CLASS'], async ([credentials, sClass]) => {
                if (credentials && sClass) {
                    // save the values to the new storage
                    await save('APP_CREDENTIALS', credentials);
                    await save('APP_CLASS', sClass);
                    return resolve();
                } else {
                    return reject('[android] Legacy storage is empty ...');
                }
            });
        });
    }
}

export {performStorageConversion}
