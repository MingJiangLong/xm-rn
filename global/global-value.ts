class GlobalValue {


    #isDev = false
    get isDev() {
        return this.#isDev
    }
    setIsDev(value: boolean) {
        this.#isDev = value
    }

}


export const globalValue = new GlobalValue();
