import { IncomingMessage, ServerResponse } from "http"
import { express } from "./myExpress"

const server = express()

server.get("/", (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200)
    res.write("WESH TU VEUX QUOI")
})

server.listen(3000, () => {
    console.log("Server started !")
})
