import {useEffect, useState} from "react";
import React from "react";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import Badge from "./Badge";
import {load} from "../tools/storage";
import {saveAndLoadClass} from "../tools/helpers";
import {useRoute} from "@react-navigation/native";

export default function TitleComponent({title, sClass, navigation, showBadge}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [classSelectOpened, setClassSelectOpened] = useState(false)

    return (
        <View>
            <View style={localStyles.titleContainer}>
                {showBadge && <TouchableOpacity onPress={() => setClassSelectOpened(!classSelectOpened)}>
                    <Badge text={sClass} color={theme.colors.surfaceSecondary}/>
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

    const route = useRoute()

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
        saveAndLoadClass(navigation, c, route.name)
    }

    return <Modal visible={show} transparent={true} onRequestClose={() => close()}>
        <TouchableWithoutFeedback onPress={close}>
            <View style={localStyle.modalWrapper}>
                {recentClasses.length > 0 ? (
                    <View style={localStyle.classSelectWrapper}>
                        <Text style={localStyle.classSelectHeadline}>Deine letzten Klassen</Text>
                        <View style={localStyle.classSelectContainer}>
                            {recentClasses.reverse().map((c, index) => (
                                <TouchableOpacity onPress={() => loadClass(c)} key={c}>
                                    <ClassIcon sClass={c} localStyles={localStyle}/>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={localStyle.classSelectWrapper}>
                        <Text style={localStyle.classSelectHeadline}>Keine kürzlich geladenen Klassen</Text>
                    </View>
                )}

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
            alignItems: "flex-start",
            height: "100%",
            width: "100%",
        },
        classSelectWrapper: {
            backgroundColor: theme.colors.surface,
            width: "auto",
            minWidth: 200,
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
            margin: 3,
            marginTop: 6
        },
        classText: {
            fontSize: 22,
            color: theme.colors.font
        },
        newColor: {
            backgroundColor: "gray"
        },
        classSelectHeadline: {
            color: theme.colors.font,
            fontSize: 18
        }
    });