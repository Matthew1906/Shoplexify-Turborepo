import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT,
  CLIENT_URL:process.env.CLIENT_URL,
  PAGE_LENGTH:process.env.PAGE_LENGTH
};
