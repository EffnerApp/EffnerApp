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
import InformationEntry from "../widgets/InformationEntry";
import AbsentClassesEntry from "../widgets/AbsentClassesEntry";


export default function SubstitutionsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const [information, setInformation] = useState();
    const [currentDate, setCurrentDate] = useState();
    const [dates, setDates] = useState([]);
    const [data, setData] = useState();
    const [substitutions, setSubstitutions] = useState([]);
    const [absentClasses, setAbsentClasses] = useState([]);

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
        setAbsentClasses(data.absentClasses.filter((e) => e.date === currentDate).map((e) => e.class + ': ' + e.period + (e.info ? ' (' + e.info + ')' : '')));
    }, [currentDate, data]);



    // useEffect(() => {
    //
    //     navigation.setOptions({
    //         headerRight: () => (
    //             // TODO: move inline styles to localStyles or globalStyles
    //             <View style={{flexDirection: "row", justifyContent: "space-between", width: "35%", marginEnd: 20}}>
    //                 <Icon name="event" color={theme.colors.onSurface} style={{alignSelf: "center",}}/>
    //                 {dates.map((date, i) => (
    //                     <TouchableOpacity
    //                         key={i}
    //                         style={[globalStyles.bigIcon, globalStyles.row, {
    //                             alignSelf: "center",
    //                             flexDirection: "row",
    //                             justifyContent: "space-between",
    //                             borderRadius: 8,
    //                             backgroundColor: theme.colors.onSurface,
    //                             padding: 4
    //                         }]}
    //                         onPress={() => setCurrentDate(date)}>
    //                         <Text style={{color: theme.colors.surface}}>{date.substring(0, date.length - 5)}</Text>
    //                     </TouchableOpacity>
    //                 ))}
    //             </View>
    //         )
    //     })
    // }, [currentDate, dates]);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                {dates?.length > 1 &&
                    <View style={localStyles.dateSelector}>
                        <View style={{alignSelf: 'center'}}>
                            <Text style={globalStyles.text}>
                                Tag auswählen:
                            </Text>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            {dates.map((date, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[globalStyles.bigIcon, globalStyles.row, {
                                        borderRadius: 8,
                                        backgroundColor: theme.colors.onSurface,
                                        padding: 4,
                                        marginHorizontal: 6
                                    }]}
                                    onPress={() => setCurrentDate(date)}>
                                    <Text style={{color: theme.colors.surface}}>{date.substring(0, date.length - 5)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                }
                <View style={localStyles.substitutions}>
                    {substitutions.map((data, i) => (
                        <View key={i}>
                            <SubstitutionEntry data={data}/>
                        </View>
                    ))}
                    {information && <InformationEntry data={information} />}
                    {absentClasses && <AbsentClassesEntry data={absentClasses} />}
                </View>
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        substitutions: {
            flexDirection: 'column',
            justifyContent: 'center'
        },
        dateSelector: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 32
        },
    });
