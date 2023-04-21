import React from "react";

import {Image, StyleSheet, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Animated, {Keyframe} from "react-native-reanimated";

import tile1 from '../assets/tiles/1.png';
import tile2 from '../assets/tiles/2.png';
import tile3 from '../assets/tiles/3.png';
import tile4 from '../assets/tiles/4.png';
import tile5 from '../assets/tiles/5.png';

export default function AnimatedIcon() {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const rollInLeft = new Keyframe({
        0: {
            transform: [
                {translateX: -800},
                {rotate: '-540deg'},
            ],
            opacity: 0
        },
        100: {
            transform: [
                {translateX: 0},
                {rotate: '0deg'},
            ],
            opacity: 1
        }
    }).duration(250).delay(0);

    const rollInTop = new Keyframe({
        0: {
            transform: [
                {translateY: -800},
                {rotate: '-540deg'},
            ],
            opacity: 0
        },
        100: {
            transform: [
                {translateY: 0},
                {rotate: '0deg'},
            ],
            opacity: 1
        }
    }).duration(750).delay(250);

    const rollInRight = new Keyframe({
        0: {
            transform: [
                {translateX: 800},
                {rotate: '540deg'},
            ],
            opacity: 0
        },
        100: {
            transform: [
                {translateX: 0},
                {rotate: '0deg'},
            ],
            opacity: 1
        }
    }).duration(250).delay(500);

    const rollInBottom = new Keyframe({
        0: {
            transform: [
                {translateY: 800},
                {rotate: '540deg'},
            ],
            opacity: 0
        },
        100: {
            transform: [
                {translateY: 0},
                {rotate: '0deg'},
            ],
            opacity: 1
        }
    }).duration(500).delay(500);

    return (
        <View style={localStyles.animationContainer}>
            <View style={localStyles.animationWrapper}>
                <Animated.View entering={rollInLeft} style={localStyles.animationItem}>
                    <Image source={tile1} style={localStyles.animationItemImage}/>
                </Animated.View>
                <Animated.View entering={rollInLeft} style={localStyles.animationItem}>
                    <Image source={tile2} style={localStyles.animationItemImage}/>
                </Animated.View>
                <Animated.View entering={rollInRight} style={localStyles.animationItem}>
                    <Image source={tile3} style={localStyles.animationItemImage}/>
                </Animated.View>
                <Animated.View entering={rollInBottom} style={localStyles.animationItem}>
                    <Image source={tile4} style={localStyles.animationItemImage}/>
                </Animated.View>
                <Animated.View entering={rollInTop} style={localStyles.animationItem}>
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
