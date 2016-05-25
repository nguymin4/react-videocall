var config = require("./config.json"),
	server = require("./lib/server");

config.PORT = process.env.PORT || config.PORT;

server.run(config);