import express from 'express';
import dotenv from 'dotenv';
import AuthRouter from "./routes/auth.route";
dotenv.config({ path: '.env' });

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/users',);
app.use('/auth', AuthRouter);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})