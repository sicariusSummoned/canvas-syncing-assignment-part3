const http = require('http');
const socketio = require('socket.io');

const fs = require('fs');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const handler = (request, response) => {
  fs.readFile(`${__dirname}/../client/index.html`, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200);
    response.write(data);
    response.end();
  });
};

const app = http.createServer(handler);
const io = socketio(app);

app.listen(PORT);

const serverUsers = {};


const onNewUser = (sock) => {
  const socket = sock;

  socket.on('newUserAdded', (data) => {
    socket.join('room1');
    console.log('User joined!');
    serverUsers[data.name] = data;
    socket.name = data.name;
    io.sockets.in('room1').emit('updateUsersList', serverUsers);
    console.log(`User:${data.name} has joined.`);
    console.dir(serverUsers);
  });
};


const onUserMoved = (sock) => {
  const socket = sock;

  socket.on('userMoved', (data) => {
    serverUsers[data.name] = data;
    io.sockets.in('room1').emit('updateUsersList', serverUsers);
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    delete serverUsers[socket.name];
    io.sockets.in('room1').emit('updateUsersList', serverUsers);
    console.log(`User:${socket.name} has left.`);
    console.dir(serverUsers);
    socket.leave('room1');
  });
};

io.on('connection', (socket) => {
  console.log('Connection started');
  onNewUser(socket);
  onUserMoved(socket);
  onDisconnect(socket);
});

console.log(`Server opened at 127.0.0.1: ${PORT}`);
