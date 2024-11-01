const express = require("express");
const { ExpressPeerServer } = require("peer");

const app = express();

app.get("/", (req, res, next) => res.send("Hello world!"));

// =======

const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
	path: "/server",
    proxied: true,
});

app.use("/peerjs", peerServer);

