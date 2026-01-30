/**
 * A React Native hook that provides keyboard visibility and height information.
 * Listens to keyboard show/hide events and returns the current state.
 *
 * @returns An object containing keyboard visibility and height.
 */
export declare function useKeyboard(): {
    isKeyboardVisible: boolean;
    keyboardHeight: number;
};
