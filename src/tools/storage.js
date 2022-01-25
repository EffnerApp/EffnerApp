import AsyncStorage from "@react-native-async-storage/async-storage";

const save = async (key, value) => {
    if (!value) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
};

const load = async (key) => {
    const data = await AsyncStorage.getItem(key);
    if (!data) return;

    return JSON.parse(data);
};

const clear = async () => {
    await AsyncStorage.clear();
}

export {save, load, clear}
