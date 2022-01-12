import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useFocusEffect} from "@react-navigation/native";
import {getLevel, groupBy, load, navigateTo, openUri, validateClass} from "../tools/helpers";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";
import moment from "moment";
import {loadDSBTimetable} from "../tools/api";
import SubstitutionEntry from "../widgets/SubstitutionEntry";
import Picker from "../components/Picker";


export default function SubstitutionsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const [information, setInformation] = useState();
    const [currentDate, setCurrentDate] = useState();
    const [dates, setDates] = useState([]);
    const [data, setData] = useState();
    const [substitutions, setSubstitutions] = useState([]);

    useEffect(() => {
        loadDSBTimetable(credentials).then(({url, time, data}) => {
            setData(data);
            setDates(data.dates);
        });
    }, []);

    useEffect(() => {
        if(!currentDate) {
            setCurrentDate(dates[0]);
        }
    }, [dates]);


    useEffect(() => {
        if(!data || !currentDate) return;
        const subs = data.days.get(currentDate).filter((entry) => validateClass(sClass, entry.name)).map((entry) => entry.items);
        let tmp = [];
        if (subs) {
            for (let i = 0; i < subs.length; i++) {
                if (subs[i]) {
                    tmp = tmp.concat(subs[i]);
                }
            }

        }
        setSubstitutions(tmp);
        setInformation(data.information.get(currentDate));
    }, [currentDate, data]);



    useEffect(() => {

        navigation.setOptions({
            headerRight: () => (
                // TODO: move inline styles to localStyles or globalStyles
                <View style={{flexDirection: "row", justifyContent: "space-between", width: "35%", marginEnd: 20}}>
                    <Icon name="event" color={theme.colors.onSurface} style={{alignSelf: "center",}}/>
                    {dates.map((date, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[globalStyles.bigIcon, globalStyles.row, {
                                alignSelf: "center",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                borderRadius: 8,
                                backgroundColor: theme.colors.onSurface,
                                padding: 4
                            }]}
                            onPress={() => setCurrentDate(date)}>
                            <Text style={{color: theme.colors.surface}}>{date.substring(0, date.length - 5)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )
        })
    }, [currentDate, dates]);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <View style={localStyles.exams}>
                    {substitutions.map((data, i) => (
                        <View key={i}>
                            <SubstitutionEntry data={data}/>
                        </View>
                    ))}
                </View>
                {/*<Text style={[globalStyles.textBigCenter, globalStyles.mv15]}>Vergangene Schulaufgaben</Text>*/}
                {/*<View style={localStyles.exams}>*/}
                {/*    {examsHistory().map(([date, items], i) => (*/}
                {/*        <View key={i}>*/}
                {/*            <Widget title={date} titleColor="#dc3545">*/}
                {/*                {items.map(({name}, j) => (*/}
                {/*                    <Text key={j} style={globalStyles.text}>{'\u2022 ' + name}</Text>*/}
                {/*                ))}*/}
                {/*            </Widget>*/}
                {/*        </View>*/}
                {/*    ))}*/}
                {/*</View>*/}
                {/*<Widget title={'Schulaufgaben für die Klasse ' + sClass} icon="event-note">*/}
                {/*    {documentUrl && (*/}
                {/*        <View>*/}
                {/*            <TouchableOpacity onPress={() => openUri(documentUrl)}><Text*/}
                {/*                style={globalStyles.text}>PDF-Version</Text></TouchableOpacity>*/}
                {/*        </View>*/}
                {/*    )}*/}
                {/*</Widget>*/}
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        exams: {
            flexDirection: 'column',
            justifyContent: 'center'
        }
    });
