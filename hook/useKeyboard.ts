import { useEffect, useMemo, useState } from "react";
import { Keyboard, KeyboardEvent } from "react-native";

export default function useKeyboard() {
    const [keyboardState, setKeyboardState] = useState({
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

        // 返回清理函数
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return useMemo(() => ({
        isKeyboardVisible: keyboardState.isVisible,
        keyboardHeight: keyboardState.height,
    }), [keyboardState]);
}