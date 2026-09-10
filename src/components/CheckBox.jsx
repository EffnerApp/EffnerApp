import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import MaterialIcons from "@react-native-vector-icons/material-icons";

export default function CheckBox({value = false, onValueChange = () => {}, title = ""}) {
    const {theme, localStyles, globalStyles} = ThemePreset(createStyles);

    return (
        <TouchableOpacity onPress={onValueChange} style={[globalStyles.box, localStyles.container]} activeOpacity={0.5}>
            <MaterialIcons color={theme.colors.onSurface} name={value ? "check-box" : "check-box-outline-blank"}/>
            <View style={{justifyContent: "center"}}>
                <Text style={globalStyles.text}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (theme = Themes.light) => StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginVertical: 4,
        marginHorizontal: 0,
        elevation: 3,
        padding: 0
    }
});
