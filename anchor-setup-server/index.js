const express = require("express");
const fs = require("fs");
const cors = require("cors");
let i = 0;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.get("/", (req, res) => {
  res.send("app running");
});

app.get("/api/v1/anchors", (req, res) => {
  const anchors = JSON.parse(fs.readFileSync("./anchor.json", "utf-8"));

  res.status(200).json(anchors).end();
});
app.get("/api/v1/tokens", (req, res) => {
  const anchors =
    i % 2 === 0
      ? JSON.parse(fs.readFileSync("./tokens1.json", "utf-8"))
      : JSON.parse(fs.readFileSync("./token2.json", "utf-8"));
  i = i % 2 === 0 ? 1 : 0;
  res.status(200).json(anchors).end();
});

app.listen(3000, () => {
  console.log("listen at 3000");
});
