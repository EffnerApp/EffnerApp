import {useEffect, useState} from "react";
import React from "react";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Alert, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import Badge from "./Badge";
import {load} from "../tools/storage";
import {navigateTo, normalize, runsOn, saveAndLoadClass} from "../tools/helpers";
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

    if (show && recentClasses.length === 0) {
        close()

        Alert.alert(
            'Schneller Klassenwechsel',
            "Wenn du die Klasse wechselst, werden dir hier die zuletzt geöffneten Klassen angezeigt. Dadurch kannst du schnell zwischen den verschiedenen Klassen wechseln, ohne lange danach suchen zu müssen. Dies ist besonders hilfreich, wenn du regelmäßig zwischen Klassen hin- und herwechselst.\n" +
            "\n" +
            "Klassen können wie gewohnt in den Einstellungen gewechselt werden."
        )
    }

    const loadClass = c => {
        close()

        // iOS is stupid and crashes if you try to navigate while the modal is still opened, so we need to wait to
        // make sure the state update triggered by close() has actually closed the modal.
        if (runsOn("ios")) {
            setTimeout(() => {
                saveAndLoadClass(navigation, c, route.name)
            }, 500)
        } else {
            saveAndLoadClass(navigation, c, route.name)
        }
    }

    return <Modal visible={show && recentClasses.length > 0} transparent={true} onRequestClose={() => close()}>
        <TouchableWithoutFeedback onPress={close}>
            <View style={localStyle.modalWrapper}>
                {recentClasses.length > 0 ? (
                    <View style={[localStyle.classSelectWrapper, {}]}>
                        <Text style={localStyle.classSelectHeadline}>Deine letzten Klassen</Text>
                        <View style={localStyle.classSelectContainer}>
                            {recentClasses.reverse().map((c, index) => (
                                <TouchableOpacity onPress={() => loadClass(c)} key={index}>
                                    <ClassIcon sClass={c} localStyles={localStyle}/>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={localStyle.classSelectWrapper}>
                        <Text style={localStyle.classSelectHeadline}></Text>
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
            width: "100%"
        },
        classSelectWrapper: {
            backgroundColor: theme.colors.surface,
            width: "auto",
            minWidth: 200,
            borderRadius: 10,
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginTop: normalize(60),
            marginLeft: normalize(10),
            borderWidth: 3,
            borderColor: theme.colors.surfaceSecondary,
            shadowColor: "#000",
            shadowOffset: {
                width: 4,
                height: 4,
            },
            shadowOpacity: 0.7,
            shadowRadius: 2,
            elevation: 4
        },
        classSelectContainer: {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 5,
        },
        classIcon: {
            padding: 8,
            backgroundColor: theme.colors.surfaceSecondary,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            marginTop: 6
        },
        classText: {
            fontSize: 22,
            color: theme.colors.secondary
        },
        newColor: {
            backgroundColor: "gray"
        },
        classSelectHeadline: {
            color: theme.colors.font,
            fontSize: 18
        }
    });