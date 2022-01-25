import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Icon} from "react-native-elements";
import {fromAngle, normalize} from "../tools/helpers";
import {LinearGradient} from "expo-linear-gradient";

export default function Widget({title, icon, headerRight, children, titleColor, iconColor, headerMarginBottom = 15, gradient}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    function WidgetHeader() {
        return (
            <View style={[localStyles.boxHeader, {marginBottom: headerMarginBottom}]}>
                <View style={localStyles.iconContainer}>
                    <Icon name={icon} color={iconColor || theme.colors.onSurface} size={normalize(20)}/>
                    <Text style={[localStyles.headerText, {marginStart: 5, color: titleColor || theme.colors.font}]}>{title}</Text>
                </View>
                {headerRight && <View style={[localStyles.headerRightContainer, headerRight.styles]}>
                    {headerRight.component}
                </View>}
            </View>
        )
    }

    function GradientWidget() {
        return (
            <LinearGradient
                style={globalStyles.box}
                start={[0, 0]}
                end={fromAngle(gradient.angle, 1.6)}
                colors={gradient.colors}
            >
                <WidgetHeader />
                {children}
            </LinearGradient>
        )
    }

    function DefaultWidget() {
        return (
            <View style={globalStyles.box}>
                <WidgetHeader />
                {children}
            </View>
        )
    }

    if(!!gradient) {
        return <GradientWidget />
    } else {
        return <DefaultWidget />
    }
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        boxHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        iconContainer: {
            flexDirection: "row",
            justifyContent: "flex-start",
            marginBottom: 0,
            paddingVertical: 2
        },
        headerRightContainer: {
            flexDirection: "row",
            backgroundColor: theme.colors.background,
            borderRadius: 4,
            paddingVertical: 2,
            paddingHorizontal: 4
        },
        headerText: {
            fontWeight: "bold",
            fontSize: normalize(17),
            alignSelf: "center",
        }
    });
