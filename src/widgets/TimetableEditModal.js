import {Button, Modal, StyleSheet, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {Themes} from "../theme/ColorThemes";
import {normalize} from "../tools/helpers";
import {ThemePreset} from "../theme/ThemePreset";
import {CheckBox} from "react-native-elements";
import {getSubjectsForLesson} from "../tools/timetable";

export default function TimetableEditModal({lesson}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [modalVisible, setModalVisible] = useState(false);

    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    useEffect(() => {
        console.log('lesson changed');

        if(lesson) {
            setAvailableSubjects(getSubjectsForLesson(lesson));
        }

        setModalVisible(!!lesson);
    }, [lesson]);

    const closeModal = () => {
        setAvailableSubjects([]);
        setSelectedSubjects([]);
        setModalVisible(false);
    }

    return (
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => {
            setModalVisible(!modalVisible);
        }}>
            <View style={localStyles.modalView}>
                <View style={localStyles.modalContentWrapper}>
                    <View style={localStyles.modalContent}>
                        <View style={globalStyles.dropShadow}>
                            <Text style={localStyles.modalHeaderText}>
                                Edit item {lesson}
                            </Text>
                            <View style={[globalStyles.box, { height: "75%" }]}>
                                {availableSubjects.map((subject, i) => (
                                    <View key={i} style={localStyles.checkboxContainer}>
                                        <CheckBox style={localStyles.checkbox} checked={selectedSubjects.includes(subject)} onPress={() => {
                                            if(selectedSubjects.includes(subject)) {
                                                setSelectedSubjects(selectedSubjects.filter((e) => e !== subject));
                                            } else {
                                                setSelectedSubjects(selectedSubjects.concat([subject]));
                                            }
                                        }} /><Text style={[globalStyles.text, localStyles.checkboxLabel]}>{subject}</Text>
                                    </View>
                                ))}
                                <Button title="Ok" onPress={closeModal}></Button>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        modalView: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 22
        },
        modalContentWrapper: {
            height: "60%",
            width: "90%",
            borderColor: theme.colors.primary,
            borderWidth: 2,
            borderRadius: 6
        },
        modalContent: {
            width: "100%",
            height: "100%",
            backgroundColor: theme.colors.background,
            padding: 20,
            justifyContent: "flex-start"
        },
        modalHeaderText: {
            fontWeight: "bold",
            fontSize: 17,
            alignSelf: "center",
            textAlign: "center",
            paddingBottom: 15,
            color: theme.colors.onBackground
        },
        checkboxContainer: {
            flexDirection: "row",
            marginBottom: 20,
        },
        checkbox: {
            alignSelf: "center",
        },
        checkboxLabel: {
            alignSelf: "center"
        },
    });
