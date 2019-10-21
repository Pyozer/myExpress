import { ServerResponse, IncomingMessage } from 'http';

export type RenderCallback = (err: Error, html: string) => void;
export type RequestListener = (req: Request, res: Response) => void;

export interface Request extends IncomingMessage {}
export interface Response extends ServerResponse {
    json(object: Object): void;
    html(html: string): void;
    send(content: string | Object): void;
}

export interface MyExpressImpl {
    listen(port: number, callback: () => void): void

    get(path: string, callback: RequestListener): void
    post(path: string, callback: RequestListener): void
    put(path: string, callback: RequestListener): void
    delete(path: string, callback: RequestListener): void
    all(path: string, callback: RequestListener): void

    render(file: string, callback: RenderCallback): void
    render(file: string, params: Record<string, string>, callback: RenderCallback): void
}