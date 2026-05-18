import { to } from "../to";
import { addTimeout } from "../add-timeout";
import { TimeoutError } from "../error";
interface I_LocationBasic {
    setRNConfiguration: (config: any) => void;
    getCurrentPosition: (success: (info: any) => void, error: (err: any) => void, options: any) => void;
}

interface I_LocationInfo {
    latitude: number;
    longitude: number;
    is_current: boolean;
}


export class LocationProvider {
    private module: I_LocationBasic | null = null;

    init<T extends I_LocationBasic>(module: T) {
        this.module = module;
    }

    private getModule() {
        if (!this.module) {
            throw new Error("[LocationProvider] Module not injected");
        }
        return this.module;
    }

    getCurrentPosition = async (): Promise<I_LocationInfo | null> => {
        const module = this.getModule();
        module.setRNConfiguration({ skipPermissionRequests: true })
        const fetchLocationPromise = new Promise<I_LocationInfo>((resolve, reject) => {
            module.getCurrentPosition(
                (info: any) => {
                    resolve({
                        latitude: info.coords.latitude,
                        longitude: info.coords.longitude,
                        is_current: true
                    });
                },
                (error: any) => {
                    const code = error?.code;
                    reject(error);
                },
                { timeout: 10000, enableHighAccuracy: false },
            );
        });

        const [_error, location] = await to(addTimeout(() => fetchLocationPromise, 10 * 1000)());
        if (_error) {
            if (_error instanceof TimeoutError) return null;
            throw _error;
        }
        return location
    }

    private getReverseGeocodeUrl(lat: number, lon: number) {
        return `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    }

    /**
     * 获取位置详细信息（包含地址、城市等）
     */
    async reversePosition(lat: number, lon: number) {
        const url = this.getReverseGeocodeUrl(lat, lon);
        const [error, res] = await to(
            addTimeout(fetch)(url, { method: "GET" })
        );
        if (error || !res) {
            return null;
        }

        try {
            const tempData = await res.text();
            const resJson = JSON.parse(tempData);
            return resJson as Record<string, string>;
        } catch (e) {
            console.error("[reversePosition] reverse failed", e);
            return null;
        }
    }
}

const LocationProviderInstance = new LocationProvider();
export default LocationProviderInstance;
