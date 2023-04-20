import {Fragment, useEffect, useState} from "react";
import React from "react";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import Badge from "./Badge";
import {loadClasses} from "../tools/api";
import {load} from "../tools/storage";
import {saveAndLoadClass} from "../tools/helpers";

export default function TitleComponent({title, sClass, navigation, showBadge}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [classSelectOpened, setClassSelectOpened] = useState(false)

    return (
        <View>
            <View style={localStyles.titleContainer}>
                {showBadge && <TouchableOpacity onPress={() => load("CLASS_HISTORY_ENABLED").then(res => {
                    if (res) {
                        setClassSelectOpened(!classSelectOpened)
                    }
                }).catch(console.error)}>
                    <Badge text={sClass} color={"#26bd90"}/>
                </TouchableOpacity>}
                <Text style={[globalStyles.text, localStyles.title]}>{title}</Text>
            </View>
            <ClassSelect localStyle={localStyles} show={classSelectOpened} close={() => setClassSelectOpened(false)} navigation={navigation}/>
        </View>
    )
}

function ClassIcon({sClass, localStyles}) {
    return <View style={[localStyles.classIcon]}>
        <Text style={localStyles.classText}>{sClass}</Text>
    </View>
}

function ClassSelect({localStyle, show, close, navigation}) {
    const [recentClasses, setRecentClasses] = useState([])

    useEffect(() => {
        // load classes
        load("RECENT_CLASSES").then(recent => {
            if (recent && recent.length > 0) {
                // remove the last element since this is the current class
                setRecentClasses(recent.slice(0, recent.length - 1))
            }
        })
    }, [])

    const loadClass = c => {
        saveAndLoadClass(navigation, c)
    }

    return <Modal visible={show} transparent={true} onRequestClose={() => close()}>
        <TouchableWithoutFeedback onPress={close}>
            <View style={localStyle.modalWrapper}>
                <View style={localStyle.classSelectWrapper}>
                    <Text style={localStyle.classSelectHeadline}>Deine letzten Klassen</Text>
                    <View style={localStyle.classSelectContainer}>
                        {recentClasses.length > 0 ? recentClasses.reverse().map((c, index) => (
                            <TouchableOpacity onPress={() => loadClass(c)} key={c}>
                                <ClassIcon sClass={c} localStyles={localStyle}/>
                            </TouchableOpacity>
                        )) : <Text>No recent classes</Text>}
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        title: {
            fontWeight: "bold",
            marginLeft: 8, // fuck this shit what the fuck where is the gap property
        },
        titleContainer: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            position: "relative",
        },
        modalWrapper: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
            width: "100%",
        },
        classSelectWrapper: {
            backgroundColor: theme.colors.surface,
            width: "90%",
            borderRadius: 10,
            padding: 5,
            marginTop: 60,
        },
        classSelectContainer: {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
        },
        classIcon: {
            padding: 8,
            backgroundColor: theme.colors.surfaceSecondary,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            margin: 1,
        },
        classText: {
            fontSize: 25,
            color: theme.colors.font
        },
        newColor: {
            backgroundColor: "gray"
        },
        classSelectHeadline: {
            color: theme.colors.font,
        }
    });