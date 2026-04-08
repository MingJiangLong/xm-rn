import { Platform } from 'react-native';

interface I_ContactBasic {
    getGroups: (...args: any[]) => Promise<any[]>
    contactsInGroup: (...args: any[]) => Promise<any[]>
    getAll: (...args: any[]) => Promise<any[]>

    selectContactPhone: (...args: any[]) => Promise<any>
}

interface I_ContactGroups<T> {
    groupName: string
    list: T[]
}


/**
 * 不主动传入模块信息会默认加载一个名为`react-native-contacts`的模块
 * @param moduleSdk 
 * @returns 
 */
export const useContact = <T extends I_ContactBasic>(moduleSdk?: T) => {

    let module: T = moduleSdk as T;

    let module2: any = undefined;
    const checkAndInitialModule = () => {
        if (!module) {
            module = require("react-native-contacts").default
        }

        if (!module) throw new Error("react-native-contacts not found")
    }
    const checkAndInitialModule2 = () => {
        if (!module2) {
            module2 = require("react-native-select-contact")
        }

        if (!module2) throw new Error("react-native-contacts not found")
    }



    async function getContactsInGroup() {
        checkAndInitialModule();
        const { getGroups, contactsInGroup, } = module
        const groups = await getGroups();
        let temp: I_ContactGroups<(typeof groups)[number]>[] = []
        for (let item of groups) {
            const data = await contactsInGroup(item.identifier)
            temp.push({ groupName: item.name, list: data })
        }
        return temp
    }
    function findGroupsForContact(id: string, groups: any[]): string {
        return groups.reduce((total, current) => {
            const find = current.list.find((item: any) => item.recordID === id)
            if (find) return [current.groupName, ...total]
            return total
        }, [] as string[]).join(",")
    }

    async function buildContactList() {
        checkAndInitialModule();
        const { getAll:getAllContacts, } = module
        try {
            const contactsInGroups = await getContactsInGroup()
            const contacts = await getAllContacts();
            const result = contacts.map((item) => {
                const name = `${item?.givenName ?? ""} ${item?.familyName}`.trim();
                return item.phoneNumbers.map((item2: any) => {
                    return ({
                        last_update_times: 0,
                        source: 'device',
                        contact_times: 0,
                        last_used_times: 0,
                        name,
                        last_contact_time: 0,
                        phone: item2.number,
                        create_time: `${Date.now()}`.slice(0, 10),
                        groups: findGroupsForContact(item.recordID, contactsInGroups),
                    })
                })
            }).flat()
            return JSON.stringify(result)
        } catch (error) {
            console.error(`[${Platform.OS}风控数据]: 构建联系人信息失败`, error);
            throw error
        }
    }
    const selectContactPhone = async (...args: Parameters<typeof module.selectContactPhone>) => {
        checkAndInitialModule2();
        const contact = await module2.selectContactPhone(...args)
        const selectedPhone = contact?.selectedPhone;
        return {
            phone: selectedPhone?.number,
            name: contact?.contact.name
        } as const
    }
    return {
        selectContactPhone,
        buildContactList,
    }
}
