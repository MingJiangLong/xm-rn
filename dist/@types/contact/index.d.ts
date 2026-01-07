interface I_ContactBasic {
    getGroups: (...args: any[]) => Promise<any[]>;
    contactsInGroup: (...args: any[]) => Promise<any[]>;
    getAllContacts: (...args: any[]) => Promise<any[]>;
    selectContactPhone: (...args: any[]) => Promise<any>;
}
export declare const useContact: <T extends I_ContactBasic>(module: T) => {
    selectContactPhone: (...args: Parameters<typeof module.selectContactPhone>) => Promise<{
        readonly phone: any;
        readonly name: any;
    }>;
    buildIOSContactInfo: () => Promise<string>;
};
export {};
