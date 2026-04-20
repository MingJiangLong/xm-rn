import { Platform } from 'react-native';

export interface Contact {
    recordId: string,
    name: string,
    phones: any[],
    emails: any[],
    postalAddresses: any[]
}

export interface ContactPhoneSelection {
    contact: Contact,
    selectedPhone: any
}
interface ContactsModule {
    getGroups: (...args: any[]) => Promise<any[]>
    contactsInGroup: (...args: any[]) => Promise<any[]>
    getAll: (...args: any[]) => Promise<any[]>
}
interface SelectContactModule {
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
export const useContact = <T extends ContactsModule, D extends SelectContactModule>(
    contactsModule?: T, selectContactModule?: D
) => {

    function getContactsModule() {
        let contacts = contactsModule;
        if (!contacts) {
            contacts = require("react-native-contacts").default
        }
        if (!contacts) throw new Error("react-native-contacts not found")
        return contacts;
    }
    const getSelectContactModule = () => {
        let selectContact = selectContactModule;
        if (!selectContact) {
            selectContact = require("react-native-select-contact")
        }

        if (!selectContact) throw new Error("react-native-contacts not found")
        return selectContact;
    }



    async function getContactsInGroup() {
        const { getGroups, contactsInGroup, } = getContactsModule()
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
        const { getAll: getAllContacts, } = getContactsModule()
        try {
            const contactsInGroups = await getContactsInGroup()
            const contacts = await getAllContacts();
            const result = contacts.map((item) => {
                const name = `${item?.givenName ?? ""} ${item?.familyName}`.trim();
                return item.phoneNumbers.map((item2: any) => {
                    return ({
                        last_contact_time: 0,
                        contact_times: 0,
                        last_update_times: 0,
                        last_used_times: 0,
                        source: 'device',
                        device: "ios",
                        phone: item2.number,
                        name,
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
    const selectContactPhone = async (...args: any[]) => {
        const selectContactModule = getSelectContactModule();
        const contact = await selectContactModule.selectContactPhone(...args)
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
