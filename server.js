const express = require("express");
const { ExpressPeerServer } = require("peer");
const app = express();
app.get("/", (req, res, next) => res.send("PeerJs Server By developer-Sharif"));

const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
	path: "/server",
});
console.log("Server Started");
app.use("/peerjs", peerServer);
