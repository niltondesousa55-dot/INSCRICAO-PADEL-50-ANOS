// FIX: Import `React` to make its type definitions, like `React.Dispatch`, available.
import React, { useState, useEffect } from 'react';

function getStorageValue<T,>(key: string, defaultValue: T): T {
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved) as T;
        } catch (error) {
            console.error('Error parsing localStorage key', key, error);
            return defaultValue;
        }
    }
    return defaultValue;
}

export const useLocalStorage = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        return getStorageValue(key, defaultValue);
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};
