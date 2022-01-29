import React, {useEffect, useState} from "react";

import {Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import Picker from "../components/Picker";
import {navigateTo, openUri, showToast} from "../tools/helpers";
import {revokePushToken, subscribeToChannel} from "../tools/push";
import {BASE_URL_GO} from "../tools/resources";
import Constants from "expo-constants";
import {load, save, clear} from "../tools/storage";
import * as Progress from 'react-native-progress';
import {getTimetableThemes} from "../theme/TimetableThemes";

export default function SettingsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const timetableThemes = getTimetableThemes();

    const [notificationsEnabled, toggleNotifications] = useState(undefined);
    const [nightThemeEnabled, toggleNightTheme] = useState(theme.name === 'dark');
    const [timetableTheme, setTimetableTheme] = useState(0);

    const appVersion = Constants.manifest.version

    useEffect(() => {
        load('APP_NOTIFICATIONS').then(toggleNotifications);
        load('APP_TIMETABLE_COLOR_THEME').then(setTimetableTheme);
    }, []);

    useEffect(() => {
        theme.setTheme(nightThemeEnabled ? 'dark' : 'light');
    }, [nightThemeEnabled]);

    useEffect(() => {
        if (notificationsEnabled === undefined) return;

        if (notificationsEnabled) {
            (async () => {
                const pushToken = await load('pushToken');
                await subscribeToChannel(credentials, 'PUSH_GLOBAL', pushToken)
                    .catch(({message, response}) => showToast('Error while registering for push notifications.', response?.data?.status?.error || message, 'error'));

                await subscribeToChannel(credentials, `PUSH_CLASS_${sClass}`, pushToken)
                    .then(() => save('APP_NOTIFICATIONS', true))
                    .catch(({message, response}) => {
                        showToast('Error while registering for push notifications.', response?.data?.status?.error || message, 'error');
                        toggleNotifications(false);
                    });
            })();
        } else {
            (async () => {
                const pushToken = await load('pushToken');
                await revokePushToken(credentials, pushToken)
                    .then(() => save('APP_NOTIFICATIONS', false))
                    .catch(({message, response}) => {
                        showToast('Error while unregistering for push notifications.', response?.data?.status?.error || message, 'error');
                        toggleNotifications(true);
                    });
            })();
        }
    }, [notificationsEnabled]);

    useEffect(() => {
        save('APP_TIMETABLE_COLOR_THEME', timetableTheme);
    }, [timetableTheme]);

    const confirmLogout = () => {
        Alert.alert(
            'Abmelden',
            'Willst du dich wirklich abmelden?',
            [
                {
                    text: 'Abbrechen',
                    style: 'cancel'
                },
                {
                    text: 'Ja',
                    onPress: () => {
                        Promise.all([
                            load("pushToken").then(pushToken => revokePushToken(credentials, pushToken)),
                            clear()
                        ]).then(() => navigateTo(navigation, 'Splash'))
                            .catch(({message, response}) => showToast('Error while performing logout.', response?.data?.status?.error || message, 'error'));
                    },
                },
            ],
            {cancelable: false}
        );
    }

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <Widget title="Benachrichtigungen" icon="notifications" headerMarginBottom={10}>
                    <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                Benachrichtigungen
                            </Text>
                        </View>
                        {notificationsEnabled === undefined &&
                            <Progress.Circle size={25} color={theme.colors.onSurface} borderWidth={3} indeterminate={true}/>
                        }
                        {notificationsEnabled !== undefined &&
                            <Switch
                                trackColor={{
                                    false: "#767577",
                                    true: theme.colors.primary,
                                }}
                                thumbColor="#fff"
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleNotifications}
                                value={!!notificationsEnabled}
                            />}
                    </View>
                </Widget>
                <Widget title="Theming" icon="palette" headerMarginBottom={10}>
                    <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                Night-Theme
                            </Text>
                        </View>
                        <Switch
                            trackColor={{
                                false: "#767577",
                                true: theme.colors.primary,
                            }}
                            thumbColor="#fff"
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleNightTheme}
                            value={nightThemeEnabled}
                        />
                    </View>
                    <View style={localStyles.line}/>
                    <View>
                        <Picker title="Stundenplan-Theme" items={timetableThemes} value={timetableTheme}
                                onSelect={(e, i) => setTimetableTheme(i)}/>
                    </View>
                </Widget>
                <Widget title="Über EffnerApp" icon="info">
                    <TouchableOpacity onPress={() => openUri('mailto:info@effner.app')}>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Feedback
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={localStyles.line}/>
                    <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                App-Version
                            </Text>
                        </View>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                Version: {appVersion}
                            </Text>
                        </View>
                    </View>
                    <View style={localStyles.line}/>
                    <TouchableOpacity onPress={() => openUri(`${BASE_URL_GO}/privacy`, {type: 'pdf'})}>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Datenschutzerklärung
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={localStyles.line}/>
                    <TouchableOpacity onPress={() => openUri(`${BASE_URL_GO}/imprint`, {type: 'pdf'})}>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Impressum
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={localStyles.line}/>
                    <TouchableOpacity onPress={() => openUri('https://status.effner.app')}>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Status
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={localStyles.line}/>
                    <TouchableOpacity>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Über die App
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Widget>
                <Widget title="Account" icon="account-circle">
                    <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                Deine Klasse
                            </Text>
                        </View>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                {sClass}
                            </Text>
                        </View>
                    </View>
                    <View style={localStyles.line}/>
                    <TouchableOpacity onPress={confirmLogout}>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Abmelden
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Widget>
            </ScrollView>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        line: {
            borderBottomColor: theme.colors.background,
            marginVertical: 9,
            borderBottomWidth: 1,
            width: "100%",
        },
    });
