import React, {useEffect, useState} from "react";

import {Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import Picker from "../components/Picker";
import {getLevel, isALevel, navigateTo, openUri, showToast} from "../tools/helpers";
import {revokePushToken, subscribeToChannel} from "../tools/push";
import {BASE_URL_GO} from "../tools/resources";
import {isDevice} from "expo-device";
import {load, save, clear} from "../tools/storage";
import * as Progress from 'react-native-progress';
import {getTimetableThemes} from "../theme/TimetableThemes";
import {loadClasses} from "../tools/api";
import Constants from "expo-constants";
import {useIsFocused} from "@react-navigation/native";

export default function SettingsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const isFocused = useIsFocused();

    const timetableThemes = getTimetableThemes();

    const [notificationsEnabled, toggleNotifications] = useState(undefined);
    const [notificationsAvailable, setNotificationsAvailable] = useState(true);

    const [pushToken, setPushToken] = useState();

    const [nightThemeEnabled, toggleNightTheme] = useState(theme.name === 'dark');
    const [timetableTheme, setTimetableTheme] = useState(0);

    const [classes, setClasses] = useState([sClass]);
    const [selectedClass, setClass] = useState(sClass);

    // const [parentScrollEnabled, setParentScrollEnabled] = useState(true);

    const appVersion = Constants.manifest.version

    useEffect(() => {
        navigation.setOptions({
            headerRight: undefined
        });
    }, [isFocused]);

    useEffect(() => {
        load('APP_TIMETABLE_COLOR_THEME').then(setTimetableTheme);
        loadClasses().then(setClasses);

        if (isDevice) {
            load('pushToken').then((token) => {
                if (token) {
                    setPushToken(token);
                    setNotificationsAvailable(true);
                } else {
                    setNotificationsAvailable(false);
                }
            });

            load('APP_NOTIFICATIONS').then((v) => toggleNotifications(!!v));
        } else {
            setNotificationsAvailable(false);
        }

    }, []);

    useEffect(() => {
        theme.setTheme(nightThemeEnabled ? 'dark' : 'light');
    }, [nightThemeEnabled]);

    useEffect(() => {
        if (notificationsEnabled === undefined || !pushToken) return;

        if (notificationsEnabled) {
            (async () => {
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
    }, [notificationsEnabled, pushToken]);

    useEffect(() => {
        if (timetableTheme === undefined)
            return;

        save('APP_TIMETABLE_COLOR_THEME', timetableTheme);
    }, [timetableTheme]);

    useEffect(() => {
        confirmClassChange(selectedClass);
    }, [selectedClass]);

    const showAbout = () => {
        Alert.alert('Über die App', 'EffnerApp by Sebastian Müller, Luis Bros & Jonathan Berger\n\n© ' + new Date().getFullYear() + ' EffnerApp - Danke an alle Mitwirkenden ❤');
    }

    const confirmClassChange = (to) => {
        if (to === sClass)
            return;

        Alert.alert(
            'Klasse ändern',
            'Willst du deine Klasse wirklich zu ' + to + ' ändern?',
            [
                {
                    text: 'Abbrechen',
                    style: 'cancel',
                    onPress: () => setClass(sClass)
                },
                {
                    text: 'Ja',
                    onPress: () => {
                        Promise.all([
                            load("pushToken").then(pushToken => revokePushToken(credentials, pushToken)),
                            save('APP_CLASS', to)
                        ]).then(() => navigateTo(navigation, 'Splash'))
                            .catch(({message, response}) => showToast('Error while performing class change.', response?.data?.status?.error || message, 'error'));
                    },
                },
            ],
            {cancelable: false}
        );
    }

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
                <View style={globalStyles.contentWrapper}>
                    <Widget title="Benachrichtigungen" icon="notifications" headerMarginBottom={10} backgroundColor="transparent" marginVertical={0}>
                        <View style={localStyles.widgetEntryContainer}>
                            <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                                <View style={{alignSelf: "center"}}>
                                    <Text style={globalStyles.text}>
                                        Benachrichtigungen
                                    </Text>
                                </View>
                                {(notificationsAvailable && notificationsEnabled === undefined) &&
                                    <Progress.Circle size={25} color={theme.colors.onSurface} borderWidth={3} indeterminate={true}/>
                                }
                                {(notificationsAvailable && notificationsEnabled !== undefined) &&
                                    <Switch
                                        trackColor={{
                                            false: "#767577",
                                            true: theme.colors.primary,
                                        }}
                                        thumbColor="#fff"
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleNotifications}
                                        value={!!notificationsEnabled}
                                        disabled={!notificationsAvailable}
                                    />
                                }
                                {!notificationsAvailable && (
                                    <View style={{alignSelf: "center"}}>
                                        <Text style={globalStyles.textDefault}>
                                            Not available
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Widget>
                    <Widget title="Theming" icon="palette" headerMarginBottom={10} backgroundColor="transparent" marginVertical={0}>
                        <View style={localStyles.widgetEntryContainer}>
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
                                <Picker title="Stundenplan-Theme" items={timetableThemes} selectedIndex={timetableTheme} onSelect={(e, i) => setTimetableTheme(i)}/>
                            </View>
                        </View>
                    </Widget>
                    <Widget title="Über EffnerApp" icon="info" backgroundColor="transparent" marginVertical={0}>
                        <View style={localStyles.widgetEntryContainer}>
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
                            <TouchableOpacity onPress={showAbout}>
                                <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                                    <View style={{alignSelf: "center"}}>
                                        <Text style={globalStyles.text}>
                                            Über die App
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Widget>
                    <Widget title="Account" icon="account-circle" backgroundColor="transparent" marginVertical={0}>
                        <View style={localStyles.widgetEntryContainer}>
                            <View>
                                <Picker title="Deine Klasse" items={classes} selectedValue={selectedClass} onSelect={(e) => setClass(e)}/>
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
                        </View>
                    </Widget>
                    <View style={{flexDirection: 'column', justifyContent: "center", paddingVertical: 20}}>
                        <Text style={[globalStyles.text, {textAlign: 'center'}]}>© {new Date().getFullYear()} EffnerApp by</Text>
                        <Text style={[globalStyles.text, {textAlign: 'center', paddingTop: 5}]}>Sebastian Müller, Luis Bros & Jonathan Berger</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        line: {
            borderBottomColor: theme.colors.surface,
            marginVertical: 9,
            borderBottomWidth: 1,
            width: "100%",
        },
        widgetEntryContainer: {
            paddingStart: 12
        }
    });
