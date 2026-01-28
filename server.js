require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

connectDB();

app.use("/auth", require("./routes/auth"));
app.use("/bank", require("./routes/bank"));
app.use("/admin", require("./routes/admin"));
app.use("/secure",require("./routes/messages"))


app.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT)
);
