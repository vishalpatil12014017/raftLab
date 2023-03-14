const express = require("express");
const createError = require("http-errors");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const constants = require("./constants/constants");
const db = require("./models");

const response = require("./lib/response");
const { checkAutorizaton } = require("./middlewares/authorization");
const jwt = require("jsonwebtoken");
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.disable("x-powered-by"); //for security
app.use("/api", routes);

// db.sequelize.sync({ force: false, alter: false });


//Socket.io Namespaces

let Broadcast = io.of("/broadcast");
let PrivateRoom = io.of("/privateroom");
app.get("/privateroom", function (req, res) {
  res.sendFile("./views/index.html", { root: path.join(__dirname) });
});
let users = 0;

Broadcast.on("connection", (socket) => {
  // console.log(`Socket ${socket.id} connected`);
  const token = socket.handshake.query.token;
  let message = "";
  if (!token) {
    socket.emit("newUserConnect", constants.STRING_CONSTANTS.PROVIDE_VALID_TOKEN);
    socket.disconnect();
  } else {
    jwt.verify(token, constants.jwt.SECRET, (err, decoded) => {
      if (err) {
        socket.emit("newUserConnect", constants.STRING_CONSTANTS.PROVIDE_VALID_TOKEN);
        socket.disconnect();
      } else {
        users++;
        socket.emit("newUserConnect", "Hii,Welcome here! ");
        socket.broadcast.emit("newUserConnect", users + " users connected");
        socket.on("my-event", (msg) => {
          console.log(`Message received from id: ${socket.id + " " + msg}`);
          socket.emit("my-event",msg=="Hii"?"Hlo, how are you?":msg=="Hlo"?"Hii, how are you?":"How are you?" );
        });
        // socket.broadcast.emit("newUserConnect",users+"connected")
        socket.on("disconnect", () => {
          users--;
          // console.log(`Socket ${socket.id} disconnected`);
          socket.broadcast.emit("newUserConnect", users + " users connected");
        });
      }
    });
  }
  // socket.emit("newUserConnect", message);
  // Leave the room when the socket disconnects
});

PrivateRoom.on("connection", (socket) => {
  // console.log(`Socket ${socket.id} connected`);
  const token = socket.handshake.query.token;
  if (!token) {
    socket.emit("newUserConnect", constants.STRING_CONSTANTS.PROVIDE_VALID_TOKEN);
    socket.disconnect();
  } else {
    jwt.verify(token, constants.jwt.SECRET, (err, decoded) => {
      if (err) {
        socket.emit("newUserConnect", constants.STRING_CONSTANTS.PROVIDE_VALID_TOKEN);
        socket.disconnect();
      } else {
        if (!constants.ACCESS.includes(decoded.role)) {
          socket.emit(
            "newUserConnect",
            "You are not Authorized for this namespace"
          );
          socket.disconnect();
        } else {
          users++;
          socket.emit("newUserConnect", "Hii,Welcome here! ");
          socket.broadcast.emit("newUserConnect", users + " users connected");
          socket.on("my-event", (msg) => {
            console.log(`Message received from id: ${socket.id + " " + msg}`);
            socket.emit("my-event",msg=="Hii"?"Hlo, how are you?":msg=="Hlo"?"Hii, how are you?":"How are you?" );
          });
          // socket.broadcast.emit("newUserConnect",users+"connected")
          socket.on("disconnect", () => {
            users--;
            // console.log(`Socket ${socket.id} disconnected`);
            socket.broadcast.emit("newUserConnect", users + " users connected");
          });
        }
      }
    });
  }
  // socket.emit("newUserConnect", message);
  // Leave the room when the socket disconnects
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
	var errors = { errors: { err: { msg: constants.STRING_CONSTANTS.ENDPOINT_NOT_FOUND + constants.SERVICE_NAME } } };
	return response.sendResponse(constants.response_code.NOT_FOUND, null, null, res, errors);
});

// error handler
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || constants.response_code.INTERNAL_SERVER_ERROR);
	res.render("error");
});

// Start the server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
