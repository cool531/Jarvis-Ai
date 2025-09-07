import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from Vite build
app.use(express.static(path.join(process.cwd(), "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
