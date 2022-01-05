import AsyncStorage from "@react-native-async-storage/async-storage";
import alert from "react-native-web/dist/exports/Alert";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import axios from "axios";
// import { BASE_URL } from "./api";
// import queryString from "query-string";
// import { CommonActions } from "@react-navigation/routers";
// import Toast from "react-native-root-toast";

export async function save(key, value) {
	if (!value) await AsyncStorage.removeItem(key);
	else await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function load(key) {
	const data = await AsyncStorage.getItem(key);
	if (!data) return;

	return JSON.parse(data);
}
//
// export async function registerForPushNotifications() {
// 	let pushToken;
// 	if (Constants.isDevice) {
// 		const { status: existingStatus } =
// 			await Notifications.getPermissionsAsync();
// 		let finalStatus = existingStatus;
// 		if (existingStatus !== "granted") {
// 			const { status } = await Notifications.requestPermissionsAsync();
// 			finalStatus = status;
// 		}
// 		if (finalStatus !== "granted") {
// 			alert("Failed to get push token for push notification!");
// 			return;
// 		}
// 		pushToken = (await Notifications.getExpoPushTokenAsync()).data;
// 		console.log(pushToken);
//
// 		const token = await load("tokenRaw");
//
// 		if (token) {
// 			await addPushToken(pushToken);
// 		}
//
// 		await save("pushToken", pushToken);
// 	}
//
// 	if (Platform.OS === "android") {
// 		await Notifications.setNotificationChannelAsync("default", {
// 			name: "default",
// 			importance: Notifications.AndroidImportance.MAX,
// 			vibrationPattern: [0, 250, 250, 250],
// 			lightColor: "#FF231F7C",
// 		});
// 	}
//
// 	return pushToken;
// }
//
// export async function addPushToken(pushToken) {
// 	await axios.post(
// 		`${BASE_URL}/push/addToken`,
// 		{
// 			pushToken,
// 		},
// 		{
// 			headers: {
// 				Authorization: "Bearer " + (await load("tokenRaw")),
// 			},
// 		}
// 	);
// }
//
// export async function revokePushToken(pushToken) {
// 	await axios.post(
// 		`${BASE_URL}/push/revokeToken`,
// 		{
// 			pushToken,
// 		},
// 		{
// 			headers: {
// 				Authorization: "Bearer " + (await load("tokenRaw")),
// 			},
// 		}
// 	);
// }
