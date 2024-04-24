import 'dotenv/config';
import {ExpoGoConfig} from "expo-constants/build/Constants.types";

export default ({config}: {config: ExpoGoConfig}) => ({
    expo: {
        ...config,
        name: "mmaoracle",
        slug: "mmaoracle",
        platforms: ["ios", "android"],
        version: "1.0.0",
        orientation: "portrait",
        scheme: "mmaoracle",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        extra: {
            googleClientId: process.env.GOOGLE_CLIENT_ID,
            apiClient: process.env.API_URL,
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            scheme: "mmaoracle",
            supportsTablet: true,
            bundleIdentifier: "com.mmaoracle.mmaoracle",
            associatedDomains: ["applinks:mmaoracle.ca", "applinks:localhost:4000"],

        },
        android: {
            package: "com.mmaoracle.mmaoracle",
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            intentFilters: [
                {
                    action: "VIEW",
                    data: {
                        scheme: "mmaoracle",
                    },
                    category: ["BROWSABLE", "DEFAULT"]
                }
            ]
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            "expo-secure-store",
                [
                "expo-font",
                    {
                        "fonts": ["node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.font"]
                    }
                ]
        ]
    }
})
