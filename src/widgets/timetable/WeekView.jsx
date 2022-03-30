import React, { useEffect, useState } from "react";

import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { ThemePreset } from "../../theme/ThemePreset";
import { Themes } from "../../theme/ColorThemes";
import { maxTimetableDepth, normalize } from "../../tools/helpers";
import { getWeekDay } from "../../tools/helpers";
import { getCellColor } from "../../theme/TimetableThemes";
import { save, load } from "../../tools/storage";

export default function WeekView({ timetable, theme: timetableTheme }) {
	const { theme, globalStyles, localStyles } = ThemePreset(createStyles);

	const [currentDepth, setCurrentDepth] = useState(0);
	const [ignoredSubjects, setIgnoredSubjects] = useState([]);
	const [enableIgnoreSubjects, setEnableIgnoreSubjects] = useState(true);

	useEffect(() => {
		setCurrentDepth(maxTimetableDepth(timetable));
	}, [timetable]);

	useEffect(() => {
		load("ignoredSubjects").then(sub => {
			if (sub) {
				setIgnoredSubjects(sub);
			}
		});
		//load ignore, setEnableIgnore
	}, []);

	return (
		<View style={localStyles.timetable}>
			<View style={localStyles.timetableTimeColumnEntry}>
				<View>
					<Text style={[globalStyles.text]}> </Text>
				</View>
				{[...Array(currentDepth).keys()].map(i => (
					<View key={i} style={[localStyles.timetableTimeEntry]}>
						<Text
							style={[
								globalStyles.text,
								localStyles.timetableEntryText,
								localStyles.textBoldCenter,
							]}>
							{i + 1}
						</Text>
					</View>
				))}
			</View>

			{timetable &&
				[...Array(5).keys()].map(i => (
					<View key={i} style={localStyles.timetableDayEntry}>
						<View>
							<Text
								style={[
									globalStyles.text,
									localStyles.textBoldCenter,
								]}>
								{getWeekDay(i)}
							</Text>
						</View>
						{timetable?.lessons[i]
							.filter((lesson, j) => j < currentDepth)
							.map((subject, j) => (
								<TouchableOpacity
									key={j}
									disabled={!enableIgnoreSubjects}
									onPress={() => {
										let temp = ignoredSubjects;
										if (temp.includes(subject)) {
											temp = temp.filter(
												s => s !== subject
											);
										} else {
											temp.push(subject);
										}
										setIgnoredSubjects(temp);
										setIgnoredSubjects(i => [...i]);
										save(
											"ignoredSubjects",
											ignoredSubjects
										);
									}}
									style={[
										localStyles.timetableEntry,
										{
											backgroundColor: getCellColor(
												timetableTheme,
												{
													meta: timetable.meta,
													subject: subject,
												}
											),
										},
									]}>
									{/* for the correct cell-size, we need to put at least a single space if the cell should be empty */}

									<Text
										style={[
											globalStyles.text,
											localStyles.timetableEntryText,
										]}>
										{!ignoredSubjects.includes(subject)
											? subject || " "
											: " "}
									</Text>
								</TouchableOpacity>
							))}
					</View>
				))}
		</View>
	);
}

const createStyles = (theme = Themes.light) =>
	StyleSheet.create({
		timetable: {
			flexDirection: "row",
			justifyContent: "center",
		},
		timetableDayEntry: {
			flexDirection: "column",
		},
		timetableEntry: {
			borderWidth: 1.3,
			borderColor: theme.colors.onSurface,
			padding: 8,
			margin: 1,
		},
		timetableEntryText: {
			fontSize: normalize(12, 24),
		},
		timetableTimeColumnEntry: {
			flexDirection: "column",
		},
		timetableTimeEntry: {
			borderWidth: 1.3,
			borderColor: theme.colors.background,
			padding: 8,
			margin: 1,
		},
		textBoldCenter: {
			fontWeight: "bold",
			textAlign: "center",
		},
	});
