import React from "react";

import {StyleSheet, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useNavigation, useRoute} from "@react-navigation/native";
import MaterialIcons from "@react-native-vector-icons/material-icons";

export default function GlobalHeader() {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const navigation = useNavigation();
    const route = useRoute();

    return (
        <View style={[globalStyles.row, globalStyles.headerButtonContainer]}>
            <TouchableOpacity
                style={globalStyles.headerButton}
                onPress={() => navigation.navigate('Settings', {...route.params})}>
                <MaterialIcons name="settings" color={theme.colors.onSurface} size={20} />
            </TouchableOpacity>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({});
