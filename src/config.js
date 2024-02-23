import { config } from "dotenv";
config();

export default {
  port: process.env.PORT || 3001,
  dbUser: process.env.DB_USER || "User",
  dbPassword: process.env.DB_PASSWORD || "User",
  dbServer: process.env.DB_SERVER || "localhost",
  dbDatabase: process.env.DB_DATABASE || "BDPrototipo",
};
