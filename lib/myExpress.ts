import http from "http"
import Route from "./Route"
import RouteType from "./RouteType"
import { readFile } from "fs"

class MyExpress {
    public server: http.Server
    public routes: Route[] = []

    constructor() {
        this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            const routeFind = this.routes.find((route) => {
                return route.path === req.url && (route.type === req.method || route.type === RouteType.ALL)
            })
            if (routeFind) {
                routeFind.callback(req, res)
            } else {
                res.writeHead(404)
                res.write("404 Route not found")
                res.end()
            }
        })
    }

    public listen(port: number, callback: () => void): void {
        this.server.listen(port, callback)
    }

    private manageListener(path: string, callback: http.RequestListener, type: RouteType) {
        const routeFind = this.routes.find((route) => route.path === path && route.type === type)
        if (!routeFind) {
            this.routes.push(new Route(path, type, callback))
        } else {
            routeFind.callback = callback
        }
    }

    public get(path: string, callback: http.RequestListener): void {
        this.manageListener(path, callback, RouteType.GET)
    }

    public post(path: string, callback: http.RequestListener): void {
        this.manageListener(path, callback, RouteType.POST)
    }

    public put(path: string, callback: http.RequestListener): void {
        this.manageListener(path, callback, RouteType.PUT)
    }

    public delete(path: string, callback: http.RequestListener): void {
        this.manageListener(path, callback, RouteType.DELETE)
    }

    public all(path: string, callback: http.RequestListener): void {
        this.manageListener(path, callback, RouteType.ALL)
    }

    public render(file: string, params: Record<string, string>, callback: (err: Error, html: string) => void): void {
        if (!file || file.trim().length < 1) throw "File template name cannot be null or empty"
        
        readFile(`./templates/${file}`, (err, data) => {
            if (err) {
                callback(err, null)
                return
            }
            let html = data.toString()
            if (params) {
                Object.keys(params).forEach((key) => {
                    const value = params[key]
                    html = html.replace(`{{${key}}}`, value)
                })
            }
            callback(null, html)
        })

    }
}

export const express = () => new MyExpress()
