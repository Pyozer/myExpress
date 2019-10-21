import { Request, Response } from './myExpress.d';
import express from "./myExpress"

const app = express()
const port = 3000

app.get("/", (req: Request, res: Response) => {
    res.json({ route: "Route / GET" })
})
app.post("/", (req: Request, res: Response) => {
    res.send({ route: "Route / POST" })
})
app.put("/test", (req: Request, res: Response) => {
    res.html("Route /test PUT")
})
app.delete("/test", (req: Request, res: Response) => {
    res.html("Route /test DELETE")
})
app.all("/all", (req: Request, res: Response) => {
    res.html(`Route /all ${req.method}`)
})

app.all("/home", (req: Request, res: Response) => {
    app.render('home', { 'username': 'PodPak', 'weight': 33.1345678 }, (err, html) => {
        if (err) {
            res.statusCode = 500
            res.json({ error: err.toString() })
        } else {
            res.html(html)
        }
    })
})

app.listen(port, () => {
    console.log("Server started !")
})
