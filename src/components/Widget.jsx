import React from "react";

import {ImageBackground, StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Icon} from "react-native-elements";
import {fromAngle, normalize} from "../tools/helpers";
import {LinearGradient} from "expo-linear-gradient";

export default function Widget({title, icon, style = {}, headerLeft, headerRight, children, titleColor, titleShadowColor, titleShadowRadius, iconColor, headerMarginBottom = 15, gradient, headerPadding = 0, backgroundColor, marginVertical = 12, image}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    function WidgetHeader() {
        return (
            <View style={[localStyles.boxHeader, {marginBottom: headerMarginBottom, paddingVertical: headerPadding}]}>
                <View style={localStyles.iconContainer}>
                    <View style={{alignSelf: 'center'}}><Icon name={icon} color={iconColor || theme.colors.onSurface} size={normalize(20)}/></View>
                    <View style={{alignSelf: 'center'}}>
                        <Text style={[localStyles.headerText, {marginStart: 5, color: titleColor || theme.colors.font, textShadowColor: titleShadowColor, textShadowRadius: titleShadowRadius}]}>{title}</Text>
                    </View>
                    {headerLeft && <View style={[localStyles.headerComponentContainer, headerLeft.styles]}>
                        {headerLeft.component}
                    </View>}
                </View>
                {headerRight && <View style={[localStyles.headerComponentContainer, headerRight.styles]}>
                    {headerRight.component}
                </View>}
            </View>
        )
    }

    function GradientWidget() {
        return (
            <LinearGradient
                style={[globalStyles.box, {marginVertical: marginVertical}, style]}
                start={[0, 0]}
                end={fromAngle(gradient.angle, 1.6)}
                colors={gradient.colors}
            >
                <WidgetHeader/>
                {children}
            </LinearGradient>
        )
    }

    function DefaultWidget() {
        return (
            <View style={[globalStyles.box, {backgroundColor: backgroundColor || theme.colors.surface, marginVertical: marginVertical}, style]}>
                <WidgetHeader/>
                {children}
            </View>
        )
    }

    function WidgetWithBackgroundImage() {
        return (
            <View style={[{marginVertical: marginVertical}, style]}>
                <ImageBackground source={image} style={[globalStyles.box, localStyles.imageBackground]}>
                    <WidgetHeader/>
                    {children}
                </ImageBackground>
            </View>

        )
    }

    if (!!gradient) {
        return <GradientWidget/>
    } else if (!!image) {
        return <WidgetWithBackgroundImage/>
    } else {
        return <DefaultWidget/>
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
        headerComponentContainer: {
            flexDirection: "row",
            backgroundColor: theme.colors.background,
            borderRadius: 4,
            paddingVertical: 2,
            paddingHorizontal: 4,
            alignSelf: "center"
        },
        headerText: {
            fontWeight: "bold",
            fontSize: normalize(19),
            alignSelf: "center",
        },
        imageBackground: {
            flex: 1,
            resizeMode: 'contain',
            justifyContent: 'center',
            overflow: 'hidden'
        }
    });
