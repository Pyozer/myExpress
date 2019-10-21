import http from "http"
import { readFile } from "fs"
import Route from "./Route"
import RouteType from "./RouteType"
import { MyExpressImpl, RenderCallback, Request, Response, RequestListener } from "./myExpress.d"
import { join } from "path"

class MyExpress implements MyExpressImpl {
    private readonly TEMPLATE_PATH = './templates'
    private readonly TEMPLATE_EXT = '.html'

    public server: http.Server
    public routes: Route[] = []

    constructor() {
        this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            const routeFind = this.routes.find((route) => {
                return route.path === req.url && (route.type === req.method || route.type === RouteType.ALL)
            })

            let request: Request = req as Request
            let response: Response = this.handleResponse(res)

            if (routeFind) {
                routeFind.callback(request, response)
            } else {
                response.writeHead(404)
                response.send("404 Route not found")
            }
        })
    }

    private handleResponse(res: http.ServerResponse): Response {
        let response: Response = res as Response
        response.json = (object: Object) => {
            response.setHeader('Content-Type', 'application/json')
            response.write(JSON.stringify(object));
            response.end();
        }
        response.html = (html: string) => {
            response.setHeader('Content-Type', 'text/html')
            response.write(html);
            response.end();
        }
        response.send = (object: string | Object) => {
            if (typeof object === 'string') response.html(object)
            else response.json(object)
        }
        return response;
    }

    public listen(port: number, callback: () => void): void {
        this.server.listen(port, callback)
    }

    private manageListener(path: string, callback: RequestListener, type: RouteType) {
        const routeFind = this.routes.find((route) => route.path === path && route.type === type)
        if (!routeFind) {
            this.routes.push(new Route(path, type, callback))
        } else {
            routeFind.callback = callback
        }
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

    public render(file: string, callback: RenderCallback): void
    public render(file: string, params: Record<string, string | number>, callback: RenderCallback): void
    public render(file: string, paramsOrCallback: Record<string, string | number> | RenderCallback, callback?: RenderCallback) {
        let params: Record<string, string | number>

        if (callback) {
            params = paramsOrCallback as Record<string, string>
        } else {
            callback = paramsOrCallback as RenderCallback
        }

        if (!file || file.trim().length < 1) throw "File template name cannot be null or empty"

        const pathName = join(
            this.TEMPLATE_PATH,
            `${file}${this.TEMPLATE_EXT}`
        )

        readFile(pathName, 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
            if (err) {
                callback(err, null)
                return
            }
            let html = data.toString()
            if (params) {
                const regex = /{{ ?(\w+)(( ?[|] ?)((\w+)(\:(\w+))?))? ?}}/gi
                html = html.replace(regex, (_, ...args: any[]): string => {
                    const [key, , , , setting, , optional]: string[] = args
                    let newValue: string = `${params[key]}`

                    if (!newValue) return 'UNDEFINED'
                    if (!setting) return newValue;

                    switch (setting.toUpperCase()) {
                        case 'UPPER': return newValue.toUpperCase()
                        case 'LOWER': return newValue.toLowerCase()
                        case 'FIXED':
                            if (parseInt(optional) === NaN) return newValue
                            if (parseFloat(newValue) === NaN) return newValue
                            return parseFloat(newValue).toFixed(parseInt(optional))

                        default:
                            return newValue
                    }

                })
            }
            callback(null, html)
        })
    }
}

export default function () {
    return new MyExpress()
}
