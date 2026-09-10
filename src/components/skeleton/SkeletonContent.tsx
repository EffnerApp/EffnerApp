import {View} from "react-native";
import React from "react";

const SkeletonContent: React.FunctionComponent = ({ children }) => {
    return (
        <View>
            {children}
        </View>
    );
};

export default React.memo(SkeletonContent);
