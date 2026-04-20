import { addTimeout } from "../add-timeout"
import { TimeoutError } from "../error"

export interface I_LocationInfo {
    latitude: number
    longitude: number
    is_current: boolean
}


type I_LocationBasic = {
    setRNConfiguration: (...args: any[]) => void
    getCurrentPosition: (...args: any[]) => void
}


export const useLocation = <T extends I_LocationBasic>(sdk?: T) => {


    const getSdk = () => {
        let module: any = sdk;
        if (!module) {
            module = require("react-native-geolocation-service").default
        }
        if (!module) throw new Error("react-native-geolocation-service not found")
        return module
    }


    function getCurrentPosition() {
        const module = getSdk()
        const fetchLocationPromise = new Promise<I_LocationInfo>((s, e) => {
            module.setRNConfiguration({ skipPermissionRequests: true })
            module.getCurrentPosition(
                (info: any) => {
                    s({
                        latitude: info.coords.latitude,
                        longitude: info.coords.longitude,
                        is_current: true
                    })
                },
                (error: any) => {
                    const code = error?.code;
                    if (code == 2) return e(new TimeoutError(error))
                    e(error)
                },
                { timeout: 10000, enableHighAccuracy: false },
            );
        })
        return addTimeout(() => fetchLocationPromise)()
    }


    const fetchLocationDescUrl = function (latitude: number, longitude: number) {
        return `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
    }

    /** 
     * 通过限量网站查询更多的位置信息
     */
    const getCurrentPositionDetail = addTimeout(
        async function () {
            const location = await getCurrentPosition();
            let url = fetchLocationDescUrl(location.latitude, location.longitude)
            const res = await fetch(url, { method: "GET" })
            const tempData = await res.text()
            const resJson = JSON.parse(tempData)
            return {
                ...resJson?.address,
                ...location
            } as {
                city: string
                state: string
                country: string
                postcode: string
                province?: string
            }
        }
    )

    return {
        getCurrentPosition,
        getCurrentPositionDetail
    }
}







