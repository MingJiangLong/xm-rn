export declare enum PermissionCode {
    Camera = "0",
    Application = "1",
    Contact = "2",
    SMS = "4",
    Location = "5",
    PhoneState = "6",
    CallLog = "7",
    Calendar = "12",
    Microphone = "13",
    FirebaseMessaging = "-1",
    UserTracking = "-2",
    Photo = "10",
    Finger = "3",
    PersonalInfo = "9",
    Wifi = "11"
}
declare class RequestPermissionStatusManager {
    private __status__;
    get status(): "requesting" | "idle";
    update(nextStatus: "requesting" | "idle"): void;
}
export declare const requestPermissionStatusManager: RequestPermissionStatusManager;
export {};
