import React, {useMemo} from "react";
import {Platform, StatusBar, StyleSheet} from "react-native";
import {ThemeProvider, useTheme} from "./theme/ThemeProvider";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import HomeScreen from "./views/Home";
import LoginScreen from "./views/Login";

import Toast from 'react-native-toast-message';
import SplashScreen from "./views/Splash";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <>
            <ThemeProvider>
                <ThemedApp/>
            </ThemeProvider>
            <Toast position="bottom" />
        </>
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
                <Stack.Screen navigationKey="splash" name="Splash" component={SplashScreen} options={{headerShown: false}}/>
                <Stack.Screen navigationKey="login" name="Login" component={LoginScreen} options={{headerShown: false}}/>
                <Stack.Screen navigationKey="home" name="Home" component={HomeScreen}/>
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
