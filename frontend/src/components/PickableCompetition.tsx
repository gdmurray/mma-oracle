import {Animated, Text} from "react-native";
import {Swipeable} from "react-native-gesture-handler";


function PickableCompetition({item}) {
    return (
        <Swipeable>
            <Animated.View>
                <Text>Fight</Text>
            </Animated.View>
        </Swipeable>
    )
}

export default PickableCompetition;
