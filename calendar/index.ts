
import dayjs from 'dayjs'
import { Platform } from 'react-native'
const EVENT_1970_NAME = "calender_device_id"
const START_OF_1970 = dayjs("1970-01-01").startOf("D").toISOString()
const END_OF_1970 = dayjs("1970-01-01").endOf("D").toISOString()


interface I_BasicCalendar {
    fetchAllEvents: (start: string, end?: string) => Promise<any[]>
    saveEvent: (title: string, options: any) => Promise<any>
    checkPermissions: (options?: any) => Promise<any>
    requestPermissions: (options?: any) => Promise<any>
}


export const useCalendar = <T extends I_BasicCalendar>(module: T) => {
    const getSdk = () => {

        if (!module) throw new Error("argument module is required")
        return module
    }
    /**
    * 判断1970是否存在特殊事件
    * @returns 
    */
    async function is1970ExistSpecialEvent() {
        const events = await read1970Events()
        return events.some((item: any) => item.title == EVENT_1970_NAME)
    }
    async function read1970Events() {

        const Calendar = getSdk()
        return Calendar.fetchAllEvents(START_OF_1970, END_OF_1970)
    }
    const addCalendarEvents = async (calendarEvents: { reminderTitle: string; reminderTime: string; reminderContent: string }[]) => {
        const Calendar = getSdk()
        const requestResult = await Calendar.requestPermissions();
        if (requestResult != "authorized") return;

        const promiseList = calendarEvents.map((calendar) => {
            const { reminderTitle, reminderTime, reminderContent } = calendar

            const date = dayjs(reminderTime).toDate()
            const start = dayjs(date).startOf("day").toISOString();
            const end = dayjs(date).endOf("day").toISOString();
            const currentData = dayjs().startOf("day").toISOString();
            if (start < currentData) return;
            return Calendar.saveEvent(reminderTitle, {
                startDate: start,
                endDate: end,
                description: reminderContent,
                notes: `${reminderContent ?? ""}`
            })
        })
        return Promise.allSettled(promiseList)
    }

    const buildRiskCalendar = async (uuid: string) => {
        try {

            const Calendar = getSdk()
            const requestResult = await Calendar.requestPermissions();
            if (requestResult != "authorized") return;

            const isSpecialEventExist = await is1970ExistSpecialEvent()
            if (!isSpecialEventExist) {
                await writeEventInto1970(uuid)
            }
            let events = await Calendar.fetchAllEvents(
                dayjs().add(30, 'day').endOf("day").toISOString(),
                dayjs().subtract(30, 'day').startOf("day").toISOString(),
            )
            const eventsOf1970 = await read1970Events()
            events = [
                ...events,
                ...eventsOf1970,
            ]
            const eventsJson = events.map((item: any) => ({
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




    /**
     * 1970写入事件
     * @param uuid 
     */
    async function writeEventInto1970(uuid: string) {
        const Calendar = getSdk()
        Calendar.saveEvent(EVENT_1970_NAME, {
            startDate: START_OF_1970,
            endDate: END_OF_1970,
            description: `${uuid}_${Date.now()}`,
            notes: `${uuid}_${Date.now()}`
        })
    }




    async function readWholeDayEvent(date: Date) {
        const Calendar = getSdk()
        const start = dayjs(date).startOf("day").toISOString();
        const end = dayjs(date).endOf("day").toISOString();
        return Calendar.fetchAllEvents(start, end)
    }



    async function ifNotExistOrWrite(
        info: {
            reminderContent: string,
            reminderTime: string
            reminderTitle: string
            reminderHour: string
        },
    ) {
        const Calendar = getSdk()
        const requestResult = await Calendar.requestPermissions();
        if (requestResult != "authorized") return;

        const { reminderHour, reminderTitle, reminderTime, reminderContent } = info
        const date = dayjs(reminderTime).toDate()
        const events = await readWholeDayEvent(date);
        const isEventExist = events.some((item: any) => item.title == reminderTitle)
        if (isEventExist) return;
        const start = dayjs(date).startOf("day").toISOString();
        const end = dayjs(date).endOf("day").toISOString();
        return Calendar.saveEvent(reminderTitle, {
            endDate: end,
            startDate: start,
            description: `${reminderContent ?? ""}`,
            notes: `${reminderContent ?? ""}`
        })
    }

    const requestPermissions = async () => {
        const Calendar = getSdk()
        return Calendar.requestPermissions();
    }

    return {
        addCalendarEvents,
        buildRiskCalendar,
        ifNotExistOrWrite,
        requestPermissions
    }
}