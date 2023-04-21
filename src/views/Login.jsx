import React, {useEffect, useRef, useState} from "react";

import {
    KeyboardAvoidingView,
    Platform, SafeAreaView, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Button from "../components/Button";

// import logo from "../assets/effnerapp_logo.svg";

import {loadClasses, login} from "../tools/api";
import {navigateTo, openUri, runsOn, showToast} from "../tools/helpers";
import {Picker} from "@react-native-picker/picker";
import {BASE_URL_GO} from "../tools/resources";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";

export default function LoginScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {error} = route.params || {};

    const [classes, setClasses] = useState([]);

    useEffect(() => {
        loadClasses().then((classes) => setClasses(classes)).catch((e) => showToast('Error while loading classes', e, 'error'))
    }, []);

    useEffect(() => {
        if (error) {
            showToast('Error', error, 'error');
        }
    }, [error]);

    const LoginInfo = {
        component: (
            <TouchableOpacity onPress={() => showToast('Anmeldedaten für die EffnerApp', 'Die Anmeldedaten sind dieselben wie in der DSBmobile-App.', 'info')}>
                <Icon name="info" color={theme.colors.onSurface}/>
            </TouchableOpacity>
        ),
        styles: {
            backgroundColor: 'transparent'
        }
    };

    function LoginForm() {

        const [running, setRunning] = useState(true);

        const idInput = useRef();
        const passwordInput = useRef();

        const [id, setId] = useState('');
        const [password, setPassword] = useState('');
        const [sClass, setClass] = useState();

        useEffect(() => {
            setClass(classes?.[0]);
        }, [classes]);

        function performLogin() {
            setRunning(true);

            const credentials = `${id}:${password}`;

            login(credentials, sClass, true)
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
            <>
                <TextInput name="id_input"
                           ref={idInput}
                           onChangeText={setId}
                           value={id}
                           style={[globalStyles.box, globalStyles.dropShadow, localStyles.boxSecondary, globalStyles.mt15]}
                           keyboardAppearance={theme.keyboardAppearance}
                           placeholder="ID"
                           keyboardType="numeric"
                           placeholderTextColor={theme.colors.onSurface}
                           returnKeyType="next"
                           blurOnSubmit={false}
                           onSubmitEditing={() => passwordInput.current.focus()}
                />
                <TextInput key="password_input"
                           ref={passwordInput}
                           onChangeText={setPassword}
                           value={password}
                           style={[globalStyles.box, globalStyles.dropShadow, localStyles.boxSecondary]}
                           keyboardAppearance={theme.keyboardAppearance}
                           placeholder="Password"
                           secureTextEntry={true}
                           placeholderTextColor={theme.colors.onSurface}
                />
                <View style={[globalStyles.box, globalStyles.dropShadow, localStyles.boxSecondary]}>
                    <Picker style={{color: theme.colors.font}}
                            dropdownIconColor={theme.colors.font}
                            selectedValue={sClass}
                            onValueChange={(value) => setClass(value)}>
                        {classes.map((c, i) => <Picker.Item key={i} label={c} value={c} color={!runsOn('android') ? theme.colors.font : null}/>)}
                    </Picker>
                </View>
                <Button icon="east" title="Login" overrideStyles={[localStyles.boxPrimary, globalStyles.mt30]} onPress={performLogin} running={running}/>
            </>
        );
    }

    return (

        <SafeAreaView style={{backgroundColor: theme.colors.background}}>
            <View style={globalStyles.fullScreen}>

                <ScrollView style={localStyles.content}>

                    <KeyboardAvoidingView style={localStyles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <View style={localStyles.logoOuterContainer}>
                            <View style={localStyles.logoContainer}>
                                {/*<SvgXml style={{alignSelf: "center"}} xml={logo} width={100} height={100}/>*/}
                            </View>
                        </View>

                        <Widget title="Anmelden" icon="login" style={globalStyles.dropShadow} headerRight={LoginInfo}>
                            <LoginForm/>
                        </Widget>
                    </KeyboardAvoidingView>
                </ScrollView>

                <View style={[globalStyles.box, globalStyles.dropShadow]}>
                    <View style={globalStyles.row}>
                        <TouchableOpacity onPress={() => openUri('https://status.effner.app')}><Text
                            style={[globalStyles.textDefault, {paddingHorizontal: 10}]}>Status</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => openUri(`${BASE_URL_GO}/imprint`, {type: 'pdf'})}><Text
                            style={[globalStyles.textDefault, {paddingHorizontal: 10}]}>Impressum</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => openUri(`${BASE_URL_GO}/privacy`, {type: 'pdf'})}><Text
                            style={[globalStyles.textDefault, {paddingHorizontal: 10}]}>Datenschutzerklärung</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        content: {
            width: "100%",
            maxWidth: "90%",
            maxHeight: "90%",
            padding: 6,
            backgroundColor: theme.colors.background,
            borderRadius: 4
        },
        keyboardAvoiding: {},
        boxPrimary: {
            backgroundColor: theme.colors.primary,
            color: theme.colors.onPrimary
        },
        boxSecondary: {
            backgroundColor: theme.colors.surfaceSecondary,
            color: theme.colors.onSurface
        },
        logoOuterContainer: {
            alignSelf: "center",
            marginBottom: 30
        },
        logoContainer: {
            // backgroundColor: theme.colors.onBackground,
            height: 150,
            width: 150,
            // borderRadius: 150 / 2,
            justifyContent: "center",
            marginBottom: 10
        }
    });
