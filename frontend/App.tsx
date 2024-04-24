import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View} from 'react-native';
import {config} from "@gluestack-ui/config"
import {GluestackUIProvider} from "@gluestack-ui/themed"
import SignInScreen from './src/screens/SignInScreen';
import HomeScreen from './src/screens/HomeScreen';
import {AuthProvider, useAuth} from "./src/components/AuthContext";
import AppNavigator from "./src/components/AppNavigator";
import {useFonts} from 'expo-font';
import {registerRootComponent} from 'expo';


const Stack = createNativeStackNavigator();
export default function App() {
    const [loaded] = useFonts({
        ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    })

    if (!loaded) {
        console.log("Not loaded yet...")
    } else {
        console.log("LOADED!!!!");
    }
    const AppContent = () => {
        const state = useAuth();

        console.log("State: ", state);
        if (state.isAuthenticated) {
            console.log("User is Authenticated");
            return <AppNavigator/>
        }
        console.log("User is not Authenticated");
        return <SignInScreen/>
    }

    return (
        <GluestackUIProvider config={config}>
            <AuthProvider>
                <AppContent/>
            </AuthProvider>
        </GluestackUIProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

registerRootComponent(App);
