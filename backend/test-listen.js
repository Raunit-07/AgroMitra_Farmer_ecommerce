import dotenv from "dotenv";
dotenv.config();

import express from 'express';
const app = express();

const server = app.listen(5005, () => {
  console.log('App started on 5005');
});

process.on('exit', () => console.log('exit'));
process.on('beforeExit', () => console.log('beforeExit'));
