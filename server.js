require('dotenv').config();
require('./db/db')
const express = require('express');
const cors = require('cors')
const userRouter = require('./routes/user');

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', userRouter);

const port = process.env.PORT || 9008;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
