import { RequestListener } from "./myExpress.d"
import RouteType from "./RouteType"

export default class Route {
    public path: string
    public type: RouteType
    public callback: RequestListener

    constructor(path: string, type: RouteType, callback: RequestListener) {
        this.path = path
        this.type = type
        this.callback = callback
    }
}
