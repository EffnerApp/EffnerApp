import React from "react";

import {StyleSheet, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Icon} from "react-native-elements";
import {useNavigation, useRoute} from "@react-navigation/native";

export default function GlobalHeader() {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const navigation = useNavigation();
    const route = useRoute();

    return (
        <View style={[globalStyles.row, globalStyles.headerButtonContainer]}>
            <TouchableOpacity
                style={globalStyles.headerButton}
                onPress={() => navigation.navigate('Settings', {...route.params})}>
                <Icon name="settings" color={theme.colors.onSurface} />
            </TouchableOpacity>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({});
