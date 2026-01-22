import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

const app = express();
dotenv.config();

app.use(express.json());

const port = process.env.PORT || 3000;

const users = [
    {
        id: 1, name: "John", refresh: null
    }, {
        id: 2, name: "Medb", refresh: null
    },
    {
        id: 3, name: "Carmille", refresh: null
    },
    {
        id: 4, name: "Tom", refresh: null
    }
]

function jwtGenerate(user) {
    const accessToken = jwt.sign(
        { name: user.name, id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m", algorithm: "HS256" },
    )

    return accessToken;
}

function jwtRefreshTokenGenerate(user) {
    const refreshToken = jwt.sign(
        { name: user.name, id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d", algorithm: "HS256" },
    )

    return refreshToken;
}

async function jwtValidate(req, res, next) {
    try {
        if (!req.headers["authorization"])
            return res.sendStatus(401);

        const token = await req.headers["authorization"].replace("Bearer ", "");

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err)
                throw new Error(err);
        })

        await next();
    } catch (err) {
        return res.status(403).json();
    }
}

async function jwtRefreshTokenValidate(req, res, next) {
    try {
        if (!req.headers["authorization"])
            return res.sendStatus(401);

        const token = await req.headers["authorization"].replace("Bearer ", "");

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err)
                throw new Error(err);

            req.user = decoded;
            req.user.token = token;
            delete req.user.exp;
            delete req.user.iat;
        });

        await next();
    } catch (err) {
        return res.status(403).json();
    }
}

app.get("/", jwtValidate, (req, res) => {
    res.send("Access granted, welcome!")
});

app.get("/", (req, res) => {
    res.send("Hello from JWT token based authentication!")
});

app.post("/auth/login", (req, res) => {
    const { name } = req.body;

    const user = users.findIndex((e) => e.name === name);

    if (!name || user < 0) {
        return res.send(400);
    }

    const accessToken = jwtGenerate(users[user]);
    const refreshToken = jwtRefreshTokenGenerate(users[user]);

    users[user].refresh = refreshToken;

    res.json({
        accessToken,
        refreshToken,
    });
});

app.post("/auth/refresh", jwtRefreshTokenValidate, (req, res) => {
    const user = users.find((e) => e.id === req.user.id && e.name === req.user.name)

    const userIndex = users.findIndex((e) => e.refresh === req.user.token)

    if (!user || userIndex < 0)
        return res.sendStatus(401)

    const accessToken = jwtGenerate(user)
    const refreshToken = jwtRefreshTokenGenerate(user)
    users[userIndex].refresh = refreshToken

    return res.json({
        accessToken,
        refreshToken
    })
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});