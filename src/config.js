import { config } from "dotenv";
config();

/* export default {
  port: process.env.PORT || 3001,
  dbUser: process.env.DB_USER || "User",
  dbPassword: process.env.DB_PASSWORD || "User",
  dbServer: process.env.DB_SERVER || "localhost",
  dbDatabase: process.env.DB_DATABASE || "BDPrototipo",
}; */ 

export default {
 port: process.env.PORT || 3001,
  dbUser: process.env.DB_USER || "sqlserver",
  dbPassword: process.env.DB_PASSWORD || "sqlserver",
  dbServer: process.env.DB_SERVER || "35.193.161.9",
  dbDatabase: process.env.DB_DATABASE || "BDPrototipo",
  options: {
        encrypt: false,
        trustServerCertificate: false 
    }
}; 
