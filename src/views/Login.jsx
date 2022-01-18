import React, {useEffect, useState} from "react";

import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Button from "../components/Button";
import {SvgXml} from "react-native-svg";

import logo from "../assets/effnerapp_logo.svg";

import {loadClasses, login} from "../tools/api";
import {navigateTo, openUri, runsOn, showToast} from "../tools/helpers";
import {Picker} from "@react-native-picker/picker";
import {BASE_URL_GO} from "../tools/resources";


export default function LoginScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {error} = route.params || {};

    const [running, setRunning] = useState(true);

    const [classes, setClasses] = useState([]);

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [sClass, setClass] = useState();

    useEffect(() => {
        if (error) {
            showToast('Error', error, 'error');
        }

        // load classes form api
        loadClasses().then((classes) => {
            setClasses(classes);
            setClass(classes?.[0]);
        }).catch((e) => showToast('Error while loading classes', e, 'error'))
    }, []);

    function performLogin() {
        setRunning(true);

        const credentials = `${id}:${password}`;

        login(credentials, sClass)
            .then(() => {
                setRunning(false);
                navigateTo(navigation, 'Splash');
            })
            .catch((e) => {
                setRunning(false);
                showToast('Error', e, 'error');
            });
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={globalStyles.screen}>
                <ScrollView style={globalStyles.content}>
                    <View style={localStyles.logoOuterContainer}>
                        <View style={localStyles.logoContainer}>
                            <SvgXml style={{alignSelf: "center"}} xml={logo} width={100} height={100}/>
                        </View>
                    </View>

                    <View style={[globalStyles.box, globalStyles.dropShadow]}>
                        <Text style={globalStyles.text}>Login</Text>
                        <TextInput onChangeText={setId}
                                   style={[globalStyles.box, localStyles.boxSecondary, globalStyles.dropShadow, globalStyles.mt15]}
                                   keyboardAppearance={theme.keyboardAppearance}
                                   placeholder="ID"
                                   keyboardType="numeric"
                                   placeholderTextColor={theme.colors.onSecondary}
                        />
                        <TextInput onChangeText={setPassword}
                                   style={[globalStyles.box, localStyles.boxSecondary, globalStyles.dropShadow]}
                                   keyboardAppearance={theme.keyboardAppearance}
                                   placeholder="Password"
                                   secureTextEntry={true}
                                   placeholderTextColor={theme.colors.onSecondary}
                        />
                        <View style={[globalStyles.box, localStyles.boxSecondary, globalStyles.dropShadow]}>
                            <Picker
                                style={{color: theme.colors.onPrimary}}
                                dropdownIconColor={theme.colors.onPrimary}
                                selectedValue={sClass}
                                onValueChange={(value) => setClass(value)}>
                                {classes.map((c, i) => <Picker.Item key={i} label={c} value={c}
                                                                    color={!runsOn('android') ? theme.colors.font : null}/>)}
                            </Picker>
                        </View>
                        <Button icon="east" title="Login" overrideStyles={[localStyles.boxPrimary, globalStyles.mt30]}
                                onPress={performLogin} running={running}/>
                    </View>
                </ScrollView>
                <View style={[globalStyles.box, globalStyles.dropShadow]}>
                    <View style={globalStyles.row}>
                        <TouchableOpacity onPress={() => openUri('https://status.effner.app')}><Text
                            style={[globalStyles.text, {paddingHorizontal: 10}]}>Status</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => openUri(`${BASE_URL_GO}/imprint`, {type: 'pdf'})}><Text
                            style={[globalStyles.text, {paddingHorizontal: 10}]}>Impressum</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => openUri(`${BASE_URL_GO}/privacy`, {type: 'pdf'})}><Text
                            style={[globalStyles.text, {paddingHorizontal: 10}]}>Datenschutzerklärung</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        boxPrimary: {
            backgroundColor: theme.colors.primary,
            color: theme.colors.onPrimary
        },
        boxSecondary: {
            backgroundColor: theme.colors.secondary,
            color: theme.colors.onSecondary
        },
        logoOuterContainer: {
            alignSelf: "center",
            marginBottom: 30
        },
        logoContainer: {
            backgroundColor: theme.colors.onBackground,
            height: 150,
            width: 150,
            borderRadius: 150 / 2,
            justifyContent: "center",
            marginBottom: 10
        }
    });
