import express from 'express';
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io"
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import AuthRouter from "./routes/auth.route";
import UsersRouter from "./routes/users.route";
import PaymentsRouter from "./routes/payments.route";
import GamesRouter from "./routes/games.route";
import RoomsRouter from "./routes/rooms.route";
import accessControl from './middlewares/accessControl';
import socketSetup from './socket/index';
import path from 'path';

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

app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/users', accessControl, UsersRouter);
app.use('/api/v1/payment', accessControl, PaymentsRouter);
app.use('/api/v1/games', accessControl, GamesRouter);
app.use('/api/v1/rooms', accessControl, RoomsRouter);

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});


// app.listen(PORT, () => {
//     console.log(`Server started on port ${PORT}`);
// })

console.log('1', '======================================')

const server = createServer(app);
// const io = new Server(server);
const io = new Server(server, {
    cors: {
        origin: '*',  // You can change this to specify a particular domain, e.g., "http://localhost:3000"
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization'], // Ensure headers you need (e.g., Authorization) are allowed
        credentials: true,  // Allow cookies and other credentials if necessary
    },
});

socketSetup(io);

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})