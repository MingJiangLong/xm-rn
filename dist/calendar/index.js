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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCalendar = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const react_native_1 = require("react-native");
const EVENT_1970_NAME = "calender_device_id";
const START_OF_1970 = (0, dayjs_1.default)("1970-01-01").startOf("D").toISOString();
const END_OF_1970 = (0, dayjs_1.default)("1970-01-01").endOf("D").toISOString();
const useCalendar = (Calendar) => {
    /**
    * 判断1970是否存在特殊事件
    * @returns
    */
    function is1970ExistSpecialEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield read1970Events();
            return events.some(item => item.title == EVENT_1970_NAME);
        });
    }
    function read1970Events() {
        return Calendar.fetchAllEvents(START_OF_1970, END_OF_1970);
    }
    const addCalendarEvents = (calendarEvents) => __awaiter(void 0, void 0, void 0, function* () {
        const promiseList = calendarEvents.map((calendar) => {
            const { reminderTitle, reminderTime, reminderContent } = calendar;
            const date = (0, dayjs_1.default)(reminderTime).toDate();
            const start = (0, dayjs_1.default)(date).startOf("day").toISOString();
            const end = (0, dayjs_1.default)(date).endOf("day").toISOString();
            return Calendar.saveEvent(reminderTitle, {
                startDate: start,
                endDate: end,
                description: reminderContent,
                notes: `${reminderContent !== null && reminderContent !== void 0 ? reminderContent : ""}`
            });
        });
        return Promise.allSettled(promiseList);
    });
    const buildIOSCalendar = (uuid) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const isSpecialEventExist = yield is1970ExistSpecialEvent();
            if (!isSpecialEventExist) {
                yield writeEventInto1970(uuid);
            }
            let events = yield Calendar.fetchAllEvents((0, dayjs_1.default)().add(30, 'day').endOf("day").toISOString(), (0, dayjs_1.default)().subtract(30, 'day').startOf("day").toISOString());
            const eventsOf1970 = yield read1970Events();
            events = [
                ...events,
                ...eventsOf1970,
            ];
            const eventsJson = events.map(item => ({
                content: react_native_1.Platform.select({
                    ios: item.notes,
                    android: item.description
                }),
                title: item.title,
                start_time: (0, dayjs_1.default)(item.startDate).valueOf(),
                end_time: (0, dayjs_1.default)(item.endDate).valueOf(),
                url: item.url
            }));
            return JSON.stringify(eventsJson);
        }
        catch (error) {
            console.warn("[risk data] 构建日历信息失败", error);
            throw error;
        }
    });
    /**
     * 1970写入事件
     * @param uuid
     */
    function writeEventInto1970(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            Calendar.saveEvent(EVENT_1970_NAME, {
                startDate: START_OF_1970,
                endDate: END_OF_1970,
                description: `${uuid}_${Date.now()}`,
                notes: `${uuid}_${Date.now()}`
            });
        });
    }
    function readWholeDayEvent(date) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = (0, dayjs_1.default)(date).startOf("day").toISOString();
            const end = (0, dayjs_1.default)(date).endOf("day").toISOString();
            return Calendar.fetchAllEvents(start, end);
        });
    }
    function ifNotExistOrWrite(info, appName) {
        return __awaiter(this, void 0, void 0, function* () {
            const { reminderHour, reminderTitle, reminderTime, reminderContent } = info;
            const date = (0, dayjs_1.default)(reminderTime).toDate();
            const events = yield readWholeDayEvent(date);
            const isEventExist = events.some(item => item.title == reminderTitle.replace(/\[.+\]/, appName));
            if (isEventExist)
                return;
            const start = (0, dayjs_1.default)(date).startOf("day").toISOString();
            const end = (0, dayjs_1.default)(date).endOf("day").toISOString();
            return Calendar.saveEvent(reminderTitle.replace(/\[.+\]/, appName), {
                endDate: end,
                startDate: start,
                description: `${reminderContent !== null && reminderContent !== void 0 ? reminderContent : ""}`.replace(/\[.+\]/, appName),
                notes: `${reminderContent !== null && reminderContent !== void 0 ? reminderContent : ""}`.replace(/\[.+\]/, appName)
            });
        });
    }
    return {
        addCalendarEvents,
        buildIOSCalendar,
        ifNotExistOrWrite
    };
};
exports.useCalendar = useCalendar;
