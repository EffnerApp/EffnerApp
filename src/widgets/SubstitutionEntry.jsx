import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";

export default function SubstitutionEntry({data}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {period, teacher, subTeacher, room, info} = data;

    function getTitle() {
        let s = period + '. Stunde';

        if(info === 'Raumänderung') {
            s += ': ' + info + ' zu Raum ' + room;
        } else if(!subTeacher || info === 'entfällt') {
            s += ': ' + info;
        } else if(subTeacher) {
            s += ' vertreten durch ' + subTeacher;
        }

        return s;
    }

    return (
        <>
            <Widget title={getTitle()} headerMarginBottom={6}>
                <View style={globalStyles.ps10}>
                    {!!teacher && <Text style={globalStyles.text}>{'\u2022 Ausfall: ' + teacher}</Text>}
                    {!!subTeacher && <Text style={globalStyles.text}>{'\u2022 Vertreten durch: ' + subTeacher}</Text>}
                    {!!room && <Text style={globalStyles.text}>{'\u2022 Raum: ' + room}</Text>}
                    {!!info && <Text style={globalStyles.text}>{'\u2022 Info: ' + info}</Text>}
                </View>
            </Widget>
        </>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
    });
