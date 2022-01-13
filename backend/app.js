const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const NotFoundError = require('./middleware/errors/notFoundError');
const { errors, celebrate, Joi } = require('celebrate');
var cors = require('cors');
const { requestLogger, errorLogger } = require('./middleware/logger');
require('dotenv').config();

const app = express();
const { PORT = 3000 } = process.env;

const { createUser, login } = require('./controllers/users');
const auth = require('./middleware/auth');
const users = require('./routes/users');
const cards = require('./routes/cards');

const invalidResource = (req, res, next) => {
  if (req.url !== '') {
    next(new NotFoundError('Requested resource not found'));
  }
  next();
};

mongoose.connect('mongodb://localhost:27017/aroundb');

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(requestLogger);
app.use(errors());

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required().min(3).max(10),
  })
}), createUser);

app.post('/signin', login);

app.use(auth);
app.use('/', users);
app.use('/', cards);
app.use(invalidResource);

app.use(errorLogger);

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? 'Internal server error' : message
  });
});

app.listen(PORT);
