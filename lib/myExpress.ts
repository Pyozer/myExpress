import http from "http"
import Route from "./Route"
import RouteType from "./RouteType"

class MyExpress {
    public server: http.Server
    public routes: Route[] = []

    constructor() {
        this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            console.log(req.url)

            const routeFind = this.routes.find((route) => {
                console.log(route)

                return route.path === req.url && (route.type === req.method || route.type === RouteType.ALL)
            })
            if (routeFind) routeFind.callback(req, res)
            else res.writeHead(404)

            res.end()
        })
    }

    public listen(port: number, callback: () => void): void {
        this.server.listen(port, callback)
    }

    private manageListener(path: string, callback: RequestCallback, type: RouteType) {
        const routeFind = this.routes.find((route) => route.path === path && route.type === type)
        if (!routeFind) {
            this.routes.push(new Route(path, type, callback))
        } else {
            routeFind.callback = callback
        }
    }

    public get(path: string, callback: RequestCallback): void {
        this.manageListener(path, callback, RouteType.GET)
    }

    public post(path: string, callback: RequestCallback): void {
        this.manageListener(path, callback, RouteType.POST)
    }

    public put(path: string, callback: RequestCallback): void {
        this.manageListener(path, callback, RouteType.PUT)
    }

    public delete(path: string, callback: RequestCallback): void {
        this.manageListener(path, callback, RouteType.DELETE)
    }

    public all(path: string, callback: RequestCallback): void {
        this.manageListener(path, callback, RouteType.ALL)
    }
}

export const express = () => new MyExpress()
