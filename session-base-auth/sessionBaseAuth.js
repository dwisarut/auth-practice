import express from "express";
import session from "express-session";
import HomeSessionBaseHandler from "./sessionHandler/home.js";
import LoginHandler from "./sessionHandler/login.js";
import processLoginHandler from "./sessionHandler/processLogin.js";
import LogoutHandler from "./sessionHandler/logout.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SECRET = "sJgspa2991" //  used for signing to session id cookie

app.use(session({
    secret: SECRET,
    cookie: { maxAge: 1000 * 60 * 5 }, // 5 minutes = 300,000 ms
    resave: true,
    saveUninitialized: false,
}));

app.get("/", HomeSessionBaseHandler);
app.get("/login", LoginHandler);
app.post("/process-login", processLoginHandler);
app.get("/logout", LogoutHandler);



app.listen(3000, () => {
    console.log("Server running on http://localhost:3000")
});