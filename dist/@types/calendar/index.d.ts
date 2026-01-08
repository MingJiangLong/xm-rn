interface I_BasicCalendar {
    fetchAllEvents: (start: string, end?: string) => Promise<any[]>;
    saveEvent: (title: string, options: any) => Promise<any>;
}
export declare const useCalendar: <T extends I_BasicCalendar>(Calendar: T) => {
    addCalendarEvents: (calendarEvents: {
        reminderTitle: string;
        reminderTime: string;
        reminderContent: string;
    }[]) => Promise<PromiseSettledResult<any>[]>;
    buildIOSCalendar: (uuid: string) => Promise<string>;
    ifNotExistOrWrite: (info: {
        reminderContent: string;
        reminderTime: string;
        reminderTitle: string;
        reminderHour: string;
    }, appName: string) => Promise<any>;
};
export {};
