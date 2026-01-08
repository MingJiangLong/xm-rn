"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useKeyboard;
const react_1 = require("react");
const react_native_1 = require("react-native");
function useKeyboard() {
    const [keyboardState, setKeyboardState] = (0, react_1.useState)({
        isVisible: false,
        height: 0,
    });
    (0, react_1.useEffect)(() => {
        const showSubscription = react_native_1.Keyboard.addListener("keyboardDidShow", (event) => {
            setKeyboardState({
                isVisible: true,
                height: event.endCoordinates.height,
            });
        });
        const hideSubscription = react_native_1.Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardState({
                isVisible: false,
                height: 0,
            });
        });
        // 返回清理函数
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    return (0, react_1.useMemo)(() => ({
        isKeyboardVisible: keyboardState.isVisible,
        keyboardHeight: keyboardState.height,
    }), [keyboardState]);
}
