import axios from "axios";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import {Platform} from "react-native";
import {BASE_URL} from "./api";
import {save} from "./helpers";

async function registerForPushNotifications() {
	let pushToken;
	if (Constants.isDevice) {
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
		pushToken = (await Notifications.getExpoPushTokenAsync()).data;
		console.log(pushToken);

		await save("pushToken", pushToken);
	}

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	return pushToken;
}

async function subscribeToChannel(credentials, channelId, pushToken) {
	await axios.post(
		`${BASE_URL}/push/subscribe/${channelId}`,
		{
			pushToken,
		},
		{
			headers: {
				Authorization: `Bearer ${credentials}`,
			},
		}
	);
}

async function revokePushToken(credentials, pushToken) {
	await axios.post(
		`${BASE_URL}/push/revokeToken`,
		{
			pushToken,
		},
		{
			headers: {
				Authorization: `Bearer ${credentials}`,
			},
		}
	);
}

export {registerForPushNotifications, subscribeToChannel, revokePushToken};
