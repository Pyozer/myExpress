import { IncomingMessage, ServerResponse } from "http"
import { express } from "./myExpress"

const server = express()
const port = 3000

server.get("/", (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200)
    res.write("Route / GET")
    res.end()
})
server.post("/", (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200)
    res.write("Route / POST")
    res.end()
})
server.put("/test", (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200)
    res.write("Route /test PUT")
    res.end()
})
server.delete("/test", (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200)
    res.write("Route /test DELETE")
    res.end()
})
server.all("/all", (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200)
    res.write(`Route /all ${req.method}`)
    res.end()
})

server.all("/home", (req: IncomingMessage, res: ServerResponse) => {
    server.render('home.html', { 'username': 'PodPak' }, (err, html) => {
        res.setHeader('Content-Type', 'text/html')
        
        if (err) {
            res.writeHead(500)
            res.write(err.toString())
        } else {
            res.writeHead(200)
            res.write(html)
        }

        res.end()
    })
})



server.listen(port, () => {
    console.log("Server started !")
})
