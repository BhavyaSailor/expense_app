const Tx = require("../models/transaction.model");
const Budget = require("../models/budget.model");
const Goal = require("../models/goal.model");

const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

const exportCSV = async (req, res, next) => {
  try {
    const transactions = await Tx.find({
      user: req.user.id,
    }).select("name amount type category date");

    const fields = [
      "name",
      "amount",
      "type",
      "category",
      "date",
    ];

    const parser = new Parser({
      fields,
    });

    const csv = parser.parse(transactions);

    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment("transactions.csv");

    return res.send(csv);

  } catch (error) {
    next(error);
  }
};

const exportPDF = async (req, res, next) => {
  try {
    const transactions = await Tx.find({
      user: req.user.id,
    });

    const budgets = await Budget.find({
      user: req.user.id,
    });

    const goals = await Goal.find({
      user: req.user.id,
    });

    // Dashboard Summary
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const savings = transactions
      .filter((tx) => tx.type === "savings")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = income - expense - savings;

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=finance-report.pdf"
    );

    doc.pipe(res);

    // ===== TITLE =====

    doc
      .fontSize(24)
      .text("Personal Finance Report", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Generated: ${new Date().toLocaleString()}`);

    doc.moveDown();

    // ===== SUMMARY =====

    doc
      .fontSize(18)
      .text("Financial Summary");

    doc.moveDown(0.5);

    doc.text(`Total Income : ₹${income}`);
    doc.text(`Total Expense : ₹${expense}`);
    doc.text(`Total Savings : ₹${savings}`);
    doc.text(`Balance : ₹${balance}`);

    doc.moveDown();

    // ===== BUDGETS =====

    doc
      .fontSize(18)
      .text("Budgets");

    doc.moveDown(0.5);

    budgets.forEach((budget) => {
      doc.text(
        `${budget.category} → Limit: ₹${budget.limit}`
      );
    });

    doc.moveDown();

    // ===== GOALS =====

    doc
      .fontSize(18)
      .text("Goals");

    doc.moveDown(0.5);

    goals.forEach((goal) => {
      const progress =
        (goal.currentAmount / goal.targetAmount) * 100;

      doc.text(
        `${goal.name}
Target: ₹${goal.targetAmount}
Saved: ₹${goal.currentAmount}
Progress: ${progress.toFixed(2)}%
`
      );

      doc.moveDown(0.5);
    });

    // ===== TRANSACTIONS =====

    doc
      .fontSize(18)
      .text("Transactions");

    doc.moveDown();

    transactions.forEach((tx) => {
      doc.text(
        `${tx.date?.toDateString()} | ${tx.name} | ₹${tx.amount} | ${tx.type} | ${tx.category}`
      );
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { exportCSV, exportPDF };