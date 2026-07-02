import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// TEST ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "Prediction Market Backend Running"
  });
});


// CREATE MARKET
app.post("/markets", async (req, res) => {
  try {
    const { title } = req.body;

    const [result] = await pool.query(
      `
      INSERT INTO markets
      (title, yes_price, no_price)
      VALUES (?, ?, ?)
      `,
      [title, 0.5, 0.5]
    );

    res.json({
      message: "Market Created",
      marketId: result.insertId
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message
    });
  }
  
});


// GET ALL MARKETS
app.get("/markets", async (req, res) => {
  try {

    const [markets] = await pool.query(
      "SELECT * FROM markets"
    );

    res.json(markets);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});
app.post("/markets/:id/buy", async (req, res) => {
  try {
    const { outcome } = req.body;
    const marketId = req.params.id;

    const [rows] = await pool.query(
      "SELECT * FROM markets WHERE id = ?",
      [marketId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Market not found" });
    }

    let market = rows[0];

    let yesPrice = Number(market.yes_price);
    let noPrice = Number(market.no_price);

    if (outcome === "YES") {
      yesPrice = Math.min(0.95, yesPrice + 0.05);
      noPrice = 1 - yesPrice;
    } else if (outcome === "NO") {
      noPrice = Math.min(0.95, noPrice + 0.05);
      yesPrice = 1 - noPrice;
    } else {
      return res.status(400).json({ error: "Invalid outcome" });
    }

    await pool.query(
      "UPDATE markets SET yes_price = ?, no_price = ? WHERE id = ?",
      [yesPrice.toFixed(2), noPrice.toFixed(2), marketId]
    );

    res.json({ message: `${outcome} bought successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});