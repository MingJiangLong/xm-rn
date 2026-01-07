"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useContact = void 0;
const react_native_1 = require("react-native");
const useContact = (module) => {
    const { getGroups, contactsInGroup, getAllContacts, } = module;
    function getContactsInGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield getGroups();
            let temp = [];
            for (let item of groups) {
                const data = yield contactsInGroup(item.identifier);
                temp.push({ groupName: item.name, list: data });
            }
            return temp;
        });
    }
    function findGroupsForContact(id, groups) {
        return groups.reduce((total, current) => {
            const find = current.list.find((item) => item.recordID === id);
            if (find)
                return [current.groupName, ...total];
            return total;
        }, []).join(",");
    }
    function buildIOSContactInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contactsInGroups = yield getContactsInGroup();
                const contacts = yield getAllContacts();
                const result = contacts.map((item) => {
                    var _a;
                    const name = `${(_a = item === null || item === void 0 ? void 0 : item.givenName) !== null && _a !== void 0 ? _a : ""} ${item === null || item === void 0 ? void 0 : item.familyName}`.trim();
                    return item.phoneNumbers.map((item2) => {
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
                        });
                    });
                }).flat();
                return JSON.stringify(result);
            }
            catch (error) {
                console.error(`[${react_native_1.Platform.OS}风控数据]: 构建联系人信息失败`, error);
                throw error;
            }
        });
    }
    const selectContactPhone = (...args) => __awaiter(void 0, void 0, void 0, function* () {
        const contact = yield module.selectContactPhone(...args);
        const selectedPhone = contact === null || contact === void 0 ? void 0 : contact.selectedPhone;
        return {
            phone: selectedPhone === null || selectedPhone === void 0 ? void 0 : selectedPhone.number,
            name: contact === null || contact === void 0 ? void 0 : contact.contact.name
        };
    });
    return {
        selectContactPhone,
        buildIOSContactInfo,
    };
};
exports.useContact = useContact;
