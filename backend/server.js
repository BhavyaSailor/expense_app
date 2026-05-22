require("dotenv").config();

const express = require("express");
const cors = require("cors");

const errorHandler = require("./src/middleware/error.middleware");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.route");
const transactionRoutes = require("./src/routes/transaction.routes")
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use(errorHandler);

const startServer = async () => {
    try {

        await connectDB();

        app.listen(process.env.PORT, () => {
            console.log(`Running server`);
        });

    } catch (error) {
        console.log(error.message);
    }
};

startServer();