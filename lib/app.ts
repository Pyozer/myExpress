import express from "./myExpress"
import { Request, Response } from "./myExpress.d"

const app = express()
const port = 3000

app.use((req, res, next) => {
    console.log("First Middleware")
    next()
})

app.use((req, res, next) => {
    console.log("Second Middleware")
    next()
})

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

app.get("/users/:id", (req: Request, res: Response) => {
    const { params, query } = req
    res.send({ route: "Route USERS / GET", params, query })
})

app.get("/users/:id/books/:bookId", (req: Request, res: Response) => {
    const { id, bookId } = req.params
    res.send({ route: "Route USERS/BOOKS / GET", id, bookId })
})

app.all("/home", (req: Request, res: Response) => {
    app.render("home", { username: "PodPak", weight: 33.1345678 }, (err, html) => {
        if (err) {
            res.json({ error: err.toString() }, 500)
        } else {
            res.html(html)
        }
    })
})

app.listen(port, () => {
    console.log("Server started !")
})
