import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_URL,
    dialect: "mysql",
  }
);

export default sequelize;
