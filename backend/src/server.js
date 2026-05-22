import "dotenv/config";
import { connectDB } from "./config/mongodb.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });
});
