const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validateUrlError = require('../middleware/errors/validateUrlError');
const {
  getUserById,
  updateUserProfile,
  updateUserAvatar,
} = require('../controllers/users');

usersRouter.get('/users/me', getUserById);

usersRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  })
}), updateUserProfile);

usersRouter.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validateUrlError)
  })
}), updateUserAvatar);

module.exports = usersRouter;
