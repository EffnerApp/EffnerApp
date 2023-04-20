import * as Notifications from "expo-notifications";
import {Alert, Platform} from "react-native";
import {runsOn, showToast, withAuthentication} from "./helpers";
import {isDevice, osVersion as OS_VERSION} from "expo-device";
import {api} from "./api";
import {startActivityAsync} from "expo-intent-launcher";
import Constants from "expo-constants";

const registerForPushNotifications = async () => {
    let pushToken;
    if (isDevice) {
        const {status: existingStatus} = await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {

            // failed, check if we're on android 13

            if (runsOn('android') && OS_VERSION.startsWith('13')) {
                Alert.alert(
                    'Failed to get push token for push notifications.',
                    'Your device is running Android ' + OS_VERSION + '. If you want to receive push notifications, you need to enable it in settings.',
                    [
                        {
                            text: 'Close',
                            style: 'cancel'
                        },
                        {
                            text: 'Open settings',
                            onPress: async () => {
                                await startActivityAsync('android.settings.APPLICATION_DETAILS_SETTINGS', {
                                    data: 'package:de.effnerapp.effner'
                                });
                            }
                        }
                    ]
                );
            } else {
                showToast('Failed to get token for push notifications.', 'You may enable push notifications manually in settings', 'info');
            }

            return;
        }

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX
            });
        }

        pushToken = await getPushToken();
        console.log('recv pushTokeyn ... ' + pushToken);
    }

    return pushToken;
};

const getPushToken = async () => {
    return (await Notifications.getExpoPushTokenAsync({
        experienceId: '@effnerapp/EffnerApp'
    })).data;
};

const subscribeToChannel = async (credentials, channelId, pushToken) => {
    console.log('subscribing to push channel ' + channelId);
    await api.post(
        `/v3/push/subscribe/${channelId}`,
        {
            pushToken,
        },
        withAuthentication(credentials)
    );
};

const revokePushToken = async (credentials, pushToken) => {
    await api.post(
        '/v3/push/revoke',
        {
            pushToken,
        },
        withAuthentication(credentials)
    );
};

export {registerForPushNotifications, getPushToken, subscribeToChannel, revokePushToken};
