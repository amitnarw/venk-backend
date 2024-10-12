import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import AuthRouter from "./routes/auth.route";
import UsersRouter from "./routes/users.route";
import PaymentsRouter from "./routes/payments.route";

const PORT = process.env.PORT;
const app = express();

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
app.use('/users', UsersRouter);
app.use('/payment', PaymentsRouter);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})