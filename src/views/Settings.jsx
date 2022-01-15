import React, {useState} from "react";

import {ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import Picker from "../components/Picker";

export default function SettingsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {sClass} = route.params || {};

    const [notificationsEnabled, toggleNotifications] = useState(false);
    const [nightThemeEnabled, toggleNightTheme] = useState(false);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <Widget title="Benachrichtigungen" icon="notifications" headerMarginBottom={6}>
                    <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                Benachrichtigungen
                            </Text>
                        </View>
                        <Switch
                            trackColor={{
                                false: "#767577",
                                true: theme.colors.primary,
                            }}
                            thumbColor="#fff"
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleNotifications}
                            value={notificationsEnabled}
                        />
                    </View>
                </Widget>
                <Widget title="Theming" icon="palette" headerMarginBottom={6}>
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
                    <View style={localStyles.line} />
                    <View style={{marginBottom: 16}}>
                        <Text style={globalStyles.text}>
                            Stundenplan-Theme
                        </Text>
                    </View>
                    <View>
                        <Picker items={["Kunterbunt", "Schwarz/Weiß", "Gelb", "Blau", "Grün"]} />
                    </View>
                    <View style={localStyles.line} />
                </Widget>
                <Widget title="Über EffnerApp" icon="info" headerMarginBottom={6}>
                    <TouchableOpacity>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Feedback
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={localStyles.line} />
                    <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                App-Version
                            </Text>
                        </View>
                        <View style={{alignSelf: "center"}}>
                            <Text style={globalStyles.text}>
                                Version: 3.x
                            </Text>
                        </View>
                    </View>
                    <View style={localStyles.line} />
                    <TouchableOpacity>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Datenschutzerklärung
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={localStyles.line} />
                    <TouchableOpacity>
                        <View style={[globalStyles.row, {justifyContent: "space-between"}]}>
                            <View style={{alignSelf: "center"}}>
                                <Text style={globalStyles.text}>
                                    Impressum
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={localStyles.line} />
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
                <Widget title="Account" icon="account-circle" headerMarginBottom={6}>
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
                    <View style={localStyles.line} />
                    <TouchableOpacity>
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
