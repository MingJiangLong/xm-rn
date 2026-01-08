import { globalValue } from "../global/global-value";


function info(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
}

function warn(message?: any, ...optionalParams: any[]) {
    console.warn(message, ...optionalParams);
}

function error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
}




export class TerminalLog {
    prefix?: string

    constructor(prefix?: string) {
        this.prefix = prefix
    }

    info(message?: any, ...optionalParams: any[]) {
        if (!globalValue.isDev) return
        console.log(this.prefix, message, ...optionalParams);
    }

    warn(message?: any, ...optionalParams: any[]) {
        if (!globalValue.isDev) return
        console.warn(this.prefix, message, ...optionalParams);
    }

    error(message?: any, ...optionalParams: any[]) {
        if (!globalValue.isDev) return
        console.error(this.prefix, message, ...optionalParams);
    }
}

