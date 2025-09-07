// index.js
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// serve static files (ถ้ามี front-end)
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Jarvis-Ai server is running!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
