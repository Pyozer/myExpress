import { readFile } from "fs"
import http from "http"
import { join } from "path"
import { parse } from "url"
import {
    MyExpressImpl,
    RenderCallback,
    Request,
    RequestListener,
    Response,
    Route,
    Transformers
} from "./myExpress.d"
import RouteType from "./RouteType"

class MyExpress implements MyExpressImpl, Transformers {
    public server: http.Server
    public routes: Route[] = []
    public middlewares: RequestListener[] = []

    private readonly TEMPLATE_PATH = "./templates"
    private readonly TEMPLATE_EXT = ".html"

    constructor() {
        this.server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
            const request: Request = this.handleRequest(req)
            const response: Response = this.handleResponse(res)

            try {
                for (const middleware of this.middlewares) {
                    await new Promise((resolve, reject) => {
                        response.on("close", reject)
                        middleware(request, response, () => resolve())
                    })
                }
            } catch (_) {
                return
            }

            const routeFind = this.routes.find((route) => {
                if (route.type !== req.method && route.type !== RouteType.ALL) { return false }

                const matcher = req.url.match(route.regex)
                const isMatched = matcher && matcher.length > 0

                if (!isMatched && route.path !== req.url) { return false }

                request.params = {}
                if (isMatched) {
                    request.params = matcher.groups
                }

                request.query = {}
                const queryStr = parse(req.url).query || ""
                queryStr.split("&").forEach((q) => {
                    const [key, value] = q.split("=")
                    request.query[key] = value
                })

                return true
            })

            if (routeFind) {
                routeFind.callback(request, response)
            } else {
                response.send("404 Route not found", 404)
            }
        })
    }

    public listen(port: number, callback: () => void): void {
        this.server.listen(port, callback)
    }

    public get(path: string, callback: RequestListener): void {
        this.manageListener(path, callback, RouteType.GET)
    }

    public post(path: string, callback: RequestListener): void {
        this.manageListener(path, callback, RouteType.POST)
    }

    public put(path: string, callback: RequestListener): void {
        this.manageListener(path, callback, RouteType.PUT)
    }

    public delete(path: string, callback: RequestListener): void {
        this.manageListener(path, callback, RouteType.DELETE)
    }

    public all(path: string, callback: RequestListener): void {
        this.manageListener(path, callback, RouteType.ALL)
    }

    public use(callback: RequestListener): void {
        if (!callback) { return }
        this.middlewares.push(callback)
    }

    public render(file: string, callback: RenderCallback): void
    public render(file: string, params: Record<string, string | number>, callback: RenderCallback): void
    public render(file: string, paramsOrCallback: Record<string, string | number> | RenderCallback, callback?: RenderCallback) {
        let params: Record<string, string | number>

        if (callback) {
            params = paramsOrCallback as Record<string, string>
        } else {
            callback = paramsOrCallback as RenderCallback
        }

        if (!file || file.trim().length < 1) { throw new Error("File template name cannot be null or empty") }

        const pathName = join(this.TEMPLATE_PATH, `${file}${this.TEMPLATE_EXT}`)

        readFile(pathName, "utf-8", (err: NodeJS.ErrnoException, data: Buffer) => {
            if (err) {
                callback(err, null)
                return
            }
            let html = data.toString()
            if (params) {
                const regex = /{{ ?(\w+)(( ?[|] ?)((\w+)(\:([0-9]+))?))? ?}}/gi

                html = html.replace(regex, (_, ...args: any[]): string => {
                    const [key, , pipe, , setting, , optional]: string[] = args
                    const newValue: string = `${params[key]}`

                    if (!newValue) { return "UNDEFINED" }
                    if (!pipe && !setting) { return newValue }

                    switch (setting.toUpperCase()) {
                        case "UPPER": return this.upper(newValue)
                        case "LOWER": return this.lower(newValue)
                        case "FIXED": return this.fixed(newValue, optional)
                    }
                    return newValue
                })
            }
            callback(null, html)
        })
    }

    public upper(value: string): string {
        return value.toUpperCase()
    }

    public lower(value: string): string {
        return value.toLowerCase()
    }

    public fixed(value: string, limit: string): string {
        if (isNaN(parseInt(limit, 10))) { return value }
        if (isNaN(parseFloat(value))) { return value }
        return parseFloat(value).toFixed(parseInt(limit, 10))
    }

    private handleRequest(req: http.IncomingMessage): Request {
        const request: Request = req as Request
        return request
    }

    private handleResponse(res: http.ServerResponse): Response {
        const response: Response = res as Response

        const sendResponse = (contentType: string, content: string, statusCode?: number) => {
            response.writeHead(statusCode || 200, { "Content-Type": contentType })
            response.write(content)
            response.end()
        }

        response.json = (object: object, statusCode?: number) => {
            sendResponse("application/json", JSON.stringify(object), statusCode)
        }
        response.html = (html: string, statusCode?: number) => {
            sendResponse("text/html", html, statusCode)
        }
        response.send = (content: string | object, statusCode?: number) => {
            if (typeof content === "string") {
                response.html(content, statusCode)
            } else {
                response.json(content, statusCode)
            }
        }
        return response
    }

    private manageListener(path: string, callback: RequestListener, type: RouteType) {
        const routeFind = this.routes.find((route) => route.path === path && route.type === type)

        if (routeFind) {
            routeFind.callback = callback
            return
        }

        const regexStr = path.replace(/\//g, "\\/").replace(/(:([\w]+))/g, (_, ...args: any[]): string => {
            const [, param] = args
            return `(?<${param}>\\w+)`
        })
        const regex = new RegExp(`^${regexStr}(\\/)?(\\?.*)?$`)

        this.routes.push({ path, regex, type, callback })
    }
}

export default function() {
    return new MyExpress()
}
