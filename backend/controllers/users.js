const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const BadRequestError = require('../middleware/errors/badRequestError');
const ConflictError = require('../middleware/errors/conflictError');

const createUser = (req, res, next) => {
  const { email, password, name, about, avatar } = req.body;

  bcrypt.hash(password, 10)
    .then(hash => User.create({
      email,
      password: hash,
      name,
      about,
      avatar
    }))
    .then((user) => {
      console.log('res', res);
      if (!user) {
        throw new Error();
      }
      res.send({ message: 'User created successfully' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Bad request'));
      } else if (err.name === "MongoServerError" && err.code === 11000) {
        next(new ConflictError('User already exists'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
  .then((user) => {
    if (!user) {
      throw new Error();
    }
    const { NODE_ENV, JWT_SECRET } = process.env;
    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      { expiresIn: '7d' });
    const owner = {
      _id: user._id,
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar
    }
    res.send({ token: token, owner });
  })
  .catch(err => next(err));
};

const getUserById = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new Error();
    })
    .then((user) => {
      res.send({ owner: user });
    })
    .catch(err => next(err));
};

const updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true }
    )
    .then((user) => {
      if (!user) {
        throw new Error();
      }
      res.send({ owner: user });
    })
    .catch(err => next(err));
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
  .then((user) => {
    if (!user) {
      throw new Error();
    }
    res.send({ owner: user });
  })
  .catch((err) => {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Bad request'));
    } else {
      next(err);
    }
  });
};

module.exports = {
  createUser,
  login,
  getUserById,
  updateUserProfile,
  updateUserAvatar
};
