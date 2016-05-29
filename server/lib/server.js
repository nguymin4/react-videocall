var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io"),
	haiku = require("./haiku");

var userIds = {};

app.use("/", express.static(process.cwd() + "/../client"));

module.exports.run = function (config) {
	server.listen(config.PORT);
	console.log("Server is listening at :" + config.PORT);
	io.listen(server, { log: true })
		.on("connection", initSocket);
};

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
	var id;
	socket
		.on("init", (data, fn) => {
			randomID(_id => {
				id = _id;
				userIds[id] = socket;
				socket.emit("init", { id: id });
			});
		})
		.on("call", data => {
			data["from"] = id;
			var to = userIds[data.to];
			if (to) to.emit("call", data);
			else socket.emit("call", { failed: true });
		})
		.on("end", data => {
			data["from"] = id;
			var to = userIds[data.to];
			if (to) to.emit("end");
		})
		.on("disconnect", () => {
			delete userIds[id];
			console.log(id, "disconnected");
		});

	return socket;
}

/**
 * Random ID until the ID is not in use
 */
function randomID(callback) {
	var id = haiku();
	if (id in userIds) setTimeout(() => haiku(callback), 5);
	else callback(id);
}