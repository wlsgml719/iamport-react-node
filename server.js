const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("첫 페이지 응답값");
});

app.post("/subscribe/key", (req, res) => {
  console.log(req);
  res.json({ result: "응답값" });
});

const port = 3002;

app.listen(port, () => {
  console.log(`node.js server run at localhost:${port}`);
});
