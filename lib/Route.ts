import { RequestListener } from "http"
import RouteType from "./RouteType"

export default class Listener {
    public path: string
    public type: RouteType
    public callback: RequestListener

    constructor(path: string, type: RouteType, callback: RequestListener) {
        this.path = path
        this.type = type
        this.callback = callback
    }
}
