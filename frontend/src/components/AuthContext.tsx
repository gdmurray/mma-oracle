import React, {createContext, useContext, useEffect, useState} from 'react';
import {deleteToken, getToken, StorageKeys} from "../utils/authStorage";
import {jwtDecode} from "jwt-decode";
import base64 from "react-native-base64";

global.atob = base64.encode;

// type AuthContext = {
//     isAuthenticated: boolean;
//     setIsAuthenticated: (isAuthenticated: boolean) => void;
// }
const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    loading: true,
    signIn: (accessToken: string) => {
    },
    signOut: () => {
    },
});

function decodeJWT(token: string) {
    try {
        const payload = token.split('.')[1];
        const decodedPayload = base64.decode(payload); // Pass `true` for Base64URL decoding
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error('Failed to decode JWT', error);
        return null;
    }
}

export function getUserFromToken(token: string) {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Failed to decode JWT', error);
        return null;
    }
}

export const AuthProvider = ({children}: React.PropsWithChildren) => {
    const [state, setState] = useState({
        isAuthenticated: false,
        user: null,
        loading: true,
    });

    useEffect(() => {
        async function loadUser() {
            const accessToken = await getToken(StorageKeys.AUTH_TOKEN)
            // console.log(accessToken);
            if (accessToken) {
                // console.log(decodeJWT(accessToken));
                // const user = getUserFromToken(accessToken);
                console.log("Setting state!");
                setState({isAuthenticated: true, user: null, loading: false});
            } else {
                setState({isAuthenticated: false, user: null, loading: false});
            }
        }

        loadUser();
    }, []);

    const signIn = async (accessToken: string) => {
        // const user = getUserFromToken(accessToken);
        setState({isAuthenticated: true, user: null, loading: false});
    }

    const signOut = async () => {
        await deleteToken(StorageKeys.AUTH_TOKEN);
        await deleteToken(StorageKeys.REFRESH_TOKEN);
        await deleteToken(StorageKeys.AUTH_TOKEN_EXPIRY);
        await deleteToken(StorageKeys.REFRESH_TOKEN_EXPIRY);
        setState({isAuthenticated: false, user: null, loading: false});

    }

    useEffect(() => {
        console.log("Is Authenticated: ", state.isAuthenticated);
    }, [state.isAuthenticated]);

    return (
        <AuthContext.Provider value={{...state, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
