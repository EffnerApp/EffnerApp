import React, {useMemo} from "react";
import {Platform, StatusBar, StyleSheet} from "react-native";
import {ThemeProvider, useTheme} from "./theme/ThemeProvider";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import HomeScreen from "./views/Home";
import LoginScreen from "./views/Login";

const Stack = createNativeStackNavigator();

export default function App() {
    // return (
    //     <View style={styles.container}>
    //         <Text>Open up App.js to start working on your app!</Text>
    //         <StatusBar style="auto"/>
    //     </View>
    // );
    return (
        <ThemeProvider>
            <ThemedApp/>
        </ThemeProvider>
    )
}

function ThemedApp() {
    const theme = useTheme();
    const options = useMemo(() => {
        if (Platform.OS === "android") {
            StatusBar.setTranslucent(false);
            StatusBar.setBackgroundColor(theme.colors.surface);
        }

        StatusBar.setBarStyle(theme.statusbar);

        return {
            headerStyle: {
                backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
        };
    }, [theme]);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={options}>
                <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
                <Stack.Screen name="Home" component={HomeScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
