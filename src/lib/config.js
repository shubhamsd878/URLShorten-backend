// import appRoot from 'app-root-path';
import { config as loadENVs } from 'dotenv';
loadENVs();

export const config = {
  production: {
    NODE_PORT: process.env.NODE_PORT,
    MYSQL_SETTINGS: {
      HOST: process.env.DB_HOST,
      DATABASE: process.env.DB_DATABASE,
      USER: process.env.DB_USER,
      PASSWORD: process.env.DB_PASSWORD,
      PORT: process.env.DB_PORT,
      DIALECT: process.env.DB_DIALECT
    },
    HOST: process.env.HOST,


  },
  staging: {
    MYSQL_SETTINGS: {
      HOST: process.env.DB_HOST,
      DATABASE: process.env.DATABASE,
      USER: process.env.DB_USER,
      PASSWORD: process.env.DB_PASSWORD,
      PORT: process.env.DB_PORT,
      DIALECT: process.env.DB_DIALECT
    },
    HOST: process.env.HOST,

  },
  development: {
    NODE_PORT: process.env.NODE_PORT,
    MYSQL_SETTINGS: {
      HOST: process.env.DB_HOST,
      DATABASE: process.env.DB_DATABASE,
      USER: process.env.DB_USER,
      PASSWORD: process.env.DB_PASSWORD,
      PORT: process.env.DB_PORT,
      DIALECT: process.env.DB_DIALECT
    },
    HOST: process.env.HOST,

  },
  DB_SYNC_KEY: process.env.DB_SYNC_SECRET,
};
