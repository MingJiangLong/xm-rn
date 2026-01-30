import { useEffect, useMemo, useState } from "react";
import { Keyboard, KeyboardEvent } from "react-native";

interface KeyboardState {
    isVisible: boolean;
    height: number;
}

/**
 * A React Native hook that provides keyboard visibility and height information.
 * Listens to keyboard show/hide events and returns the current state.
 *
 * @returns An object containing keyboard visibility and height.
 */
export function useKeyboard() {
    const [keyboardState, setKeyboardState] = useState<KeyboardState>({
        isVisible: false,
        height: 0,
    });

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            "keyboardDidShow",
            (event: KeyboardEvent) => {
                setKeyboardState({
                    isVisible: true,
                    height: event.endCoordinates.height,
                });
            }
        );

        const hideSubscription = Keyboard.addListener(
            "keyboardDidHide",
            () => {
                setKeyboardState({
                    isVisible: false,
                    height: 0,
                });
            }
        );

        // Cleanup subscriptions on unmount
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return useMemo(
        () => ({
            isKeyboardVisible: keyboardState.isVisible,
            keyboardHeight: keyboardState.height,
        }),
        [keyboardState.isVisible, keyboardState.height]
    );
}