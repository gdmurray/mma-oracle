import * as SecureStore from 'expo-secure-store';

export enum StorageKeys {
    AUTH_TOKEN = "authToken",
    REFRESH_TOKEN = "refreshToken",
    AUTH_TOKEN_EXPIRY = "authTokenExpiry",
    REFRESH_TOKEN_EXPIRY = "refreshTokenExpiry",
}
export const storeToken = async (key: StorageKeys, token: string) => {
    try {
        await SecureStore.setItemAsync(key, token);
    } catch (error) {
        console.error('Failed to save the auth token', error);
    }
};

export const getToken = async (key: StorageKeys) => {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error('Failed to fetch the auth token', error);
    }
};

export const deleteToken = async (key: StorageKeys) => {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error('Failed to delete the auth token', error);
    }
};
