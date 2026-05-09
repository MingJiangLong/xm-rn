
import dayjs from 'dayjs'
import { Platform } from 'react-native'
import { to } from '../to'
const EVENT_1970_NAME = "calender_device_id"
const START_OF_1970 = dayjs("1970-01-01").startOf("D").toISOString()
const END_OF_1970 = dayjs("1970-01-01").endOf("D").toISOString()


interface I_BasicCalendar {
    fetchAllEvents: (...args: any[]) => Promise<any[]>
    saveEvent: (...args: any[]) => Promise<any>
    requestPermissions: (...args: any[]) => Promise<any>
}


export class CalendarProviderSDK {


    private module: I_BasicCalendar | null = null

    init<T extends I_BasicCalendar>(module: T) {
        this.module = module;
    }

    private isReady() {
        if (!this.module) {
            console.error("[CalendarProvider] Calendar module not injected");
            return false
        }
        return !!this.module;
    }

    private async is1970ExistSpecialEvent() {
        const events = await this.read1970Events()
        if (!events || !events.length) return false;
        return events.some(item => item.title == EVENT_1970_NAME)
    }

    private async readEvents(startData: string, endData: string) {
        if (!this.isReady()) return [];
        const status = await this.requestPermissions()
        if (status != "granted") return []
        const [error, data] = await to(this.module!.fetchAllEvents(startData, endData))
        if (error) return []
        return data
    }

    private async read1970Events() {
        return this.readEvents(START_OF_1970, END_OF_1970)
    }

    private async writeEventInto1970(uuid: string) {
        if (!this.isReady()) return
        const status = await this.requestPermissions()
        if (status != "granted") return
        this.module!.saveEvent(EVENT_1970_NAME, {
            startDate: START_OF_1970,
            endDate: END_OF_1970,
            description: `${uuid}_${Date.now()}`,
            notes: `${uuid}_${Date.now()}`
        })
    }

    async addCalendarEvents(calendarEvents: { reminderTitle: string; reminderTime: string; reminderContent: string }[]) {
        if (!this.isReady()) return;
        const status = await this.requestPermissions()
        if (status != "granted") return
        const times = calendarEvents.map(c => dayjs(c.reminderTime).valueOf());
        const minStart = dayjs(Math.min(...times)).startOf("day").toISOString();
        const maxEnd = dayjs(Math.max(...times)).endOf("day").toISOString();

        const existingEvents = await this.readEvents(minStart, maxEnd);

        const existingTitles = new Set(existingEvents.map(e => e.title));
        const todayStart = dayjs().startOf("day").toISOString();

        const pendingEvents = calendarEvents.filter(item => {
            const itemStart = dayjs(item.reminderTime).startOf("day").toISOString();
            const isFuture = itemStart >= todayStart;
            const notExists = !existingTitles.has(item.reminderTitle);
            return isFuture && notExists;
        });
        const promiseList = pendingEvents.map(async (calendar) => {
            const { reminderTitle, reminderTime, reminderContent } = calendar
            const date = dayjs(reminderTime).toDate()
            const start = dayjs(date).startOf("day").toISOString();
            const end = dayjs(date).endOf("day").toISOString();

            return this.module!.saveEvent(reminderTitle, {
                startDate: start,
                endDate: end,
                description: reminderContent,
                notes: `${reminderContent ?? ""}`
            })
        })
        return Promise.allSettled(promiseList)
    }
    async buildRiskData(uuid: string) {
        try {
            const isSpecialEventExist = await this.is1970ExistSpecialEvent()
            if (!isSpecialEventExist) {
                await this.writeEventInto1970(uuid)
            }
            let events = await this.module!.fetchAllEvents(
                dayjs().subtract(30, 'day').startOf("day").toISOString(),
                dayjs().add(30, 'day').endOf("day").toISOString(),
            )
            const eventsOf1970 = await this.read1970Events()
            events = [
                ...events,
                ...eventsOf1970 ?? [],
            ]
            const eventsJson = events.map(item => ({
                content: Platform.select({
                    ios: item.notes,
                    android: item.description
                }),
                title: item.title,
                start_time: dayjs(item.startDate).valueOf(),
                end_time: dayjs(item.endDate).valueOf(),
                url: item.url

            }))
            return JSON.stringify(eventsJson);
        } catch (error) {
            console.warn("[risk data] 构建日历信息失败", error);
            throw error
        }
    }

    async requestPermissions() {
        if (!this.isReady()) return "blocked";
        const status = await this.module!.requestPermissions()
        if (status != "authorized") return "blocked";
        return "granted"
    }
}

const CalendarProviderInstance = new CalendarProviderSDK();
export default CalendarProviderInstance;