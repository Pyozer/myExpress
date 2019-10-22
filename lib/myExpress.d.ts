import { RenderCallback, RequestListener } from './myExpress.d';
import { ServerResponse, IncomingMessage } from 'http';
import RouteType from './RouteType'

export type RenderCallback = (err: Error, html: string) => void;
export type RequestListener = (req: Request, res: Response, next?: Function) => void;

export interface Request extends IncomingMessage {
    params: {[k: string]: string}
    query: {[k: string]: string}
}
export interface Response extends ServerResponse {
    json(object: object, statusCode?: number): void;
    html(html: string, statusCode?: number): void;
    send(content: string | object, statusCode?: number): void;
}

export interface MyExpressImpl {
    listen(port: number, callback: () => void): void

    get(path: string, callback: RequestListener): void
    post(path: string, callback: RequestListener): void
    put(path: string, callback: RequestListener): void
    delete(path: string, callback: RequestListener): void
    all(path: string, callback: RequestListener): void

    use(callback: RequestListener): void

    render(file: string, callback: RenderCallback): void
    render(file: string, params: Record<string, string>, callback: RenderCallback): void
}

export interface Route {
    path: string
    regex: RegExp
    type: RouteType
    callback: RequestListener
}

export interface Transformers {
    upper(value: string): string
    lower(value: string): string
    fixed(value: string, limit: string): string
}
