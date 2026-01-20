import express from "express";
import expressBasicAuth from "express-basic-auth";

const app = express();

app.use(expressBasicAuth({
    users: { 'admin': 'password' }
}));

app.get("/", (req, res) => {
    res.send("Hello from basic authentication.");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});