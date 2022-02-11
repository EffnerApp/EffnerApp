import * as Notifications from "expo-notifications";
import {Platform} from "react-native";
import {withAuthentication} from "./helpers";
import {isDevice} from "expo-device";
import {api} from "./api";

const registerForPushNotifications = async () => {
	let pushToken;
	if (isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			alert("Failed to get push token for push notification!");
			return;
		}
		pushToken = await getPushToken();
		console.log('recv pushToken ... ' + pushToken);
	}

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX
		});
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
