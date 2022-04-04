const mongoose =  require("mongoose");
const Msg = require("./models/message"); 
const app = require("express")();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const mongooDB= "mongodb+srv://zeeshan02:zeeshan02@cluster0.3pjr3.mongodb.net/message-database?retryWrites=true&w=majority";
mongoose.connect(mongooDB, { useNewUrlParser: true,
useUnifiedTopology: true }).then(()=>{
    console.log("connected");
}).catch(err => console.log(err))
const PORT = 8000;


const users = {};

io.on("connection", (socket) => {
  console.log("someone connecte and socket id " + socket.id);

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);

    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
      }
    }
 
    io.emit("all_users", users);
  });

  socket.on("new_user", (username) => {
    console.log("Server : " + username);
    users[username] = socket.id;
    io.emit("all_users", users)
  });

  socket.on("send_message", (data) => {
    console.log(data);
    const message = new Msg({msg:data.receiver});
    message.save().then(()=>{
        const socketId = users[data.receiver];
        io.to(socketId).emit("new_message", data);
    }) 
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server Listening on port ${PORT}`);
});