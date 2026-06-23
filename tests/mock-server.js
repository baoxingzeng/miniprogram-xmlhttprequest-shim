import fs from "fs";
import express from "express";
import cors from "cors";
import { formidable } from "formidable";

const app = express();
app.use(cors());

app.get("/ping", (req, res) => {
    res.send("pong");
});

app.get("/api/user", (req, res) => {
    const { id } = req.query;
    res.status(200).json({
        id: id || 1,
        name: "张三🎉",
        age: 25
    });
});

app.post("/api/upload", (req, res, next) => {
    formidable({}).parse(req, (err, fields, files) => {
        if (err) {
            return next(err);
        }
        const file = files?.file?.[0];
        res.status(201).json({
            code: 0,
            message: "success",
            data: {
                name: fields?.name?.[0] || null,
                age: fields?.age?.[0] || null,
                file: file ? {
                    filename: file.originalFilename,
                    size: file.size,
                    content: fs.readFileSync(file.filepath, "utf-8"),
                } : null,
            }
        });
    });
});

app.get("/api/timeout", async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    res.status(200).json({ code: 0, message: "success" });
});

app.get("/api/not-found", (req, res) => {
    res.status(404).json({ code: 404, message: "Not Found" });
});

app.get("/api/header-test", (req, res) => {
    res.json({
        token: req.headers["x-token"],
        contentType: req.headers["content-type"]
    });
});

app.get("/api/cookie/set", (req, res) => {
    const { name, value } = req.query;
    res.cookie(String(name), String(value));
    res.cookie("sessionId", "abc123xyz456", { httpOnly: true, secure: false });
    res.cookie("theme", "dark", { maxAge: 3000 });
    res.json({
        code: 0,
        message: "Cookies set",
        data: { name, value }
    });
});

app.get("/api/cookie/echo", (req, res) => {
    const cookieHeader = req.headers.cookie || '';
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        const name = parts.shift()?.trim() || '';
        const value = parts.join('=').trim();
        if (name) {
            cookies[name] = decodeURIComponent(value);
        }
    });
    res.json({
        code: 0,
        cookies,
        cookieHeader
    });
});

app.get("/api/cookie/clear", (req, res) => {
    res.clearCookie("sessionId");
    res.clearCookie("theme");
    res.json({
        code: 0,
        message: "Cookies cleared"
    });
});

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`Mock server started: http://localhost:${PORT}`);
});

export default server;
