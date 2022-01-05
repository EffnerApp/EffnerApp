import React, {useEffect, useRef} from "react";

import {ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Button from "../components/Button";
import {SvgXml} from "react-native-svg";

import logo from "../assets/effnerapp_logo.svg";


export default function LoginScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const id = useRef("")
    const password = useRef("");

    useEffect(() => {

    }, []);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <View style={localStyles.logoOuterContainer}>
                    <View style={localStyles.logoContainer}>
                        <SvgXml style={{alignSelf: "center"}} xml={logo} width={100} height={100}/>
                    </View>
                </View>
                <View style={[globalStyles.box, globalStyles.dropShadow]}>
                    <Text style={globalStyles.text}>Login</Text>
                    <TextInput ref={id}
                               style={[globalStyles.box, localStyles.boxSecondary, globalStyles.dropShadow, globalStyles.mt15]}
                               placeholder="ID"
                               keyboardType="numeric"
                               placeholderTextColor={theme.colors.onSecondary}
                    />
                    <TextInput ref={password}
                               style={[globalStyles.box, localStyles.boxSecondary, globalStyles.dropShadow]}
                               placeholder="Password"
                               secureTextEntry={true}
                               placeholderTextColor={theme.colors.onSecondary}
                    />
                    <Button icon="east" title="Login" overrideStyles={[localStyles.boxPrimary, globalStyles.mt30]}/>
                </View>
            </ScrollView>
            <View style={[globalStyles.box, globalStyles.dropShadow]}>
                <View style={globalStyles.row}>
                    <Text style={[globalStyles.text, {paddingHorizontal: 10}]}>Status</Text>
                    <Text style={[globalStyles.text, {paddingHorizontal: 10}]}>Impressum</Text>
                    <Text style={[globalStyles.text, {paddingHorizontal: 10}]}>Datenschutzerklärung</Text>
                </View>
            </View>
        </View>

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
