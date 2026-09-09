import React, {useEffect} from "react";

import {Image, StyleSheet, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from "react-native-reanimated";

import tile1 from '../assets/tiles/1.png';
import tile2 from '../assets/tiles/2.png';
import tile3 from '../assets/tiles/3.png';
import tile4 from '../assets/tiles/4.png';
import tile5 from '../assets/tiles/5.png';

function useRollIn({axis, distance, rotateFrom, duration, delay}) {
    const translate = useSharedValue(distance);
    const rotate = useSharedValue(rotateFrom);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translate.value = withDelay(delay, withTiming(0, {duration}));
        rotate.value = withDelay(delay, withTiming(0, {duration}));
        opacity.value = withDelay(delay, withTiming(1, {duration}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            axis === 'x'
                ? {translateX: translate.value}
                : {translateY: translate.value},
            {rotate: `${rotate.value}deg`},
        ],
    }));
}

export default function AnimatedIcon() {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    // rollInLeft
    const style1 = useRollIn({axis: 'x', distance: -800, rotateFrom: -540, duration: 250, delay: 0});
    // rollInLeft
    const style2 = useRollIn({axis: 'x', distance: -800, rotateFrom: -540, duration: 250, delay: 0});
    // rollInRight
    const style3 = useRollIn({axis: 'x', distance: 800, rotateFrom: 540, duration: 250, delay: 500});
    // rollInBottom
    const style4 = useRollIn({axis: 'y', distance: 800, rotateFrom: 540, duration: 500, delay: 500});
    // rollInTop
    const style5 = useRollIn({axis: 'y', distance: -800, rotateFrom: -540, duration: 750, delay: 250});

    return (
        <View style={localStyles.animationContainer}>
            <View style={localStyles.animationWrapper}>
                <Animated.View style={[localStyles.animationItem, style1]}>
                    <Image source={tile1} style={localStyles.animationItemImage}/>
                </Animated.View>
                <Animated.View style={[localStyles.animationItem, style2]}>
                    <Image source={tile2} style={localStyles.animationItemImage}/>
                </Animated.View>
                <Animated.View style={[localStyles.animationItem, style3]}>
                    <Image source={tile3} style={localStyles.animationItemImage}/>
                </Animated.View>
                <Animated.View style={[localStyles.animationItem, style4]}>
                    <Image source={tile4} style={localStyles.animationItemImage}/>
                </Animated.View>
                <Animated.View style={[localStyles.animationItem, style5]}>
                    <Image source={tile5} style={localStyles.animationItemImage}/>
                </Animated.View>
            </View>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        animationContainer: {
            width: 100,
            height: 100
        },
        animationWrapper: {
            position: 'relative',
            width: 100,
            height: 100
        },
        animationItem: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: 100,
            height: 100
        },
        animationItemImage: {
            width: 100,
            height: 100
        }
    });
