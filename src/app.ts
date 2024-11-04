import express from 'express';
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io"
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import AuthRouter from "./routes/auth.route";
import UsersRouter from "./routes/users.route";
import PaymentsRouter from "./routes/payments.route";
import RoomsRouter from "./routes/rooms.route";
import accessControl from './middlewares/accessControl';
import socketSetup from './socket/index';
import path from 'path'; // Import path module

const PORT = process.env.PORT;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var corsOptions = {
    origin: function (origin: any, callback: any) {
        callback(null, true);
    },
    credentials: true,
};

app.use(cors(corsOptions));

app.use('/auth', AuthRouter);
app.use('/users', accessControl, UsersRouter);
app.use('/payment', accessControl, PaymentsRouter);
app.use('/room', accessControl, RoomsRouter);

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});


// app.listen(PORT, () => {
//     console.log(`Server started on port ${PORT}`);
// })

const server = createServer(app);
const io = new Server(server);

socketSetup(io);

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})