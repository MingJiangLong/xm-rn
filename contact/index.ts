import { Platform } from 'react-native';

interface I_ContactBasic {
    getGroups: (...args: any[]) => Promise<any[]>;
    contactsInGroup: (...args: any[]) => Promise<any[]>;
    getAll: (...args: any[]) => Promise<any[]>;

    selectContactPhone: (...args: any[]) => Promise<any>;
}

interface I_ContactGroups {
    groupName: string;
    list: any[];
}

export class ContactProviderSDK {
    private module: I_ContactBasic | null = null;

    init<T extends I_ContactBasic>(module: T) {
        this.module = module;
    }

    private async getContactsInGroup(): Promise<I_ContactGroups[]> {

        const { module } = this;
        if (!module) return [];

        const groups = await module.getGroups();
        let temp: I_ContactGroups[] = [];

        for (let item of groups) {
            const data = await module.contactsInGroup(item.identifier);
            temp.push({ groupName: item.name, list: data });
        }
        return temp;
    }


    private findGroupsForContact(id: string, groups: I_ContactGroups[]): string {
        return groups.reduce((total, current) => {
            const find = current.list.find((item: any) => item.recordID === id);
            if (find) return [current.groupName, ...total];
            return total;
        }, [] as string[]).join(",");
    }

    buildRiskContact = async () => {
        const { module } = this;
        if (!module) return JSON.stringify([]);
        try {
            const [contactsInGroups, contacts] = await Promise.all([
                this.getContactsInGroup(),
                module.getAll()
            ]);

            const result = contacts.flatMap((item) => {
                const name = `${item?.givenName ?? ""} ${item?.familyName ?? ""}`.trim();
                return (item.phoneNumbers || []).map((phoneObj: any) => ({
                    last_update_times: 0,
                    source: 'device',
                    contact_times: 0,
                    last_used_times: 0,
                    name,
                    last_contact_time: 0,
                    phone: phoneObj.number,
                    groups: this.findGroupsForContact(item.recordID, contactsInGroups),
                }));
            });

            return JSON.stringify(result);
        } catch (error) {
            console.error(`[${Platform.OS}风控数据]: 构建联系人信息失败`, error);
            throw error;
        }
    }

    /**
     * 选择联系人电话
     */
    selectContactPhone = async (...args: any[]) => {
        const { module } = this;
        if (!module) return null;

        const contact = await module.selectContactPhone(...args);
        const selectedPhone = contact?.selectedPhone;

        return {
            phone: selectedPhone?.number,
            name: contact?.contact?.name
        };
    }
}

const ContactProviderInstance = new ContactProviderSDK();
export default ContactProviderInstance;
