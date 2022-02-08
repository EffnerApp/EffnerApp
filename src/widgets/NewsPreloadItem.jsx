import {StyleSheet, View} from "react-native";
import SkeletonContent from "../components/skeleton/SkeletonContent";
import {normalize} from "../tools/helpers";
import Widget from "../components/Widget";
import React from "react";
import {Themes} from "../theme/ColorThemes";
import {ThemePreset} from "../theme/ThemePreset";

export default function NewsPreloadItem() {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <Widget headerLeft={{
            component: <SkeletonContent containerStyle={{}} isLoading={true} layout={[{width: 260, height: 30}]} boneColor="#292929" highlightColor="#333333"/>,
            styles: localStyles.headerPreloadItemContainer
        }}>
            <View style={globalStyles.row}>
                <SkeletonContent containerStyle={{}} isLoading={true} layout={[{width: normalize(100), height: normalize(100)}]} boneColor="#292929" highlightColor="#333333"/>
                <View style={localStyles.contentContainer}>
                    <SkeletonContent containerStyle={localStyles.textPreloadItem} isLoading={true} layout={[{width: 250, height: 20}]} boneColor="#292929" highlightColor="#333333" animationType="pulse"/>
                    <SkeletonContent containerStyle={localStyles.textPreloadItem} isLoading={true} layout={[{width: 250, height: 20}]} boneColor="#292929" highlightColor="#333333" animationType="pulse"/>
                    <SkeletonContent containerStyle={localStyles.textPreloadItem} isLoading={true} layout={[{width: 120, height: 20}]} boneColor="#292929" highlightColor="#333333" animationType="pulse"/>
                </View>
            </View>
        </Widget>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        contentContainer: {
            flexWrap: 'wrap',
            flexShrink: 1
        },
        textPreloadItem: {
            paddingVertical: 5
        },
        headerPreloadItemContainer: {
            backgroundColor: 'transparent'
        }
    });
