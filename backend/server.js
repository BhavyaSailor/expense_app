require("dotenv").config();

const express = require("express");
const cors = require("cors");

const errorHandler = require("./src/middleware/error.middleware");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.route");
const transactionRoutes = require("./src/routes/transaction.routes")
const budgetRoutes = require("./src/routes/budget.routes")
const dashboardRoutes = require("./src/routes/dashboard.routes")
const analyticsRoutes = require("./src/routes/analytics.routes");
const goalRoutes = require("./src/routes/goal.routes");
const exportRoutes = require("./src/routes/export.routes");
const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Expense Tracker API",
  });
});app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/export", exportRoutes);
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