import React, {useRef, useState} from "react";

import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Icon} from "react-native-elements";
import * as Progress from 'react-native-progress';


export default function Button({title, icon, overrideStyles = {}, onPress = () => null}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [isProcessing, setProcessing] = useState(false);

    return (
        <TouchableOpacity style={[globalStyles.box, globalStyles.dropShadow, globalStyles.row, overrideStyles]} disabled={isProcessing} onPress={() => {
            setProcessing(true);
            onPress();
        }}>
            <Text style={[globalStyles.textBigCenter, localStyles.center]}>
                {title}
            </Text>
            {(icon && !isProcessing) && <Icon
                name={icon}
                color={theme.colors.onSurface}
            />}
            {isProcessing &&
                <Progress.Circle size={25} color={theme.colors.onSurface} borderWidth={3} indeterminate={true} />
            }

        </TouchableOpacity>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        center: {
            alignSelf: "center"
        }
    });
