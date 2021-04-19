const express = require("express");
const app = express();
const cors = require("cors");
const uploadRoutes = require("./routes/api/uploads");
app.use("*", cors());
app.use(express.json());
app.use(uploadRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).send({ ok: true });
});

app.listen(8000);
