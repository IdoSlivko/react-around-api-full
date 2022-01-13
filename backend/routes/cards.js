const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validateUrlError = require('../middleware/errors/validateUrlError');
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardsRouter.get('/cards', getCards);

cardsRouter.post('/cards', celebrate({
  body: Joi.object().keys({
    user: Joi.object().keys({
      _id: Joi.string().hex().required()
    }),
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(validateUrlError)
  })
}), createCard);

cardsRouter.delete('/cards/:cardId', celebrate({
  body: Joi.object().keys({
    user: Joi.object().keys({
      _id: Joi.string().hex().required()
    })
  }),
  params: Joi.object().keys({
    cardId: Joi.string().hex().required()
  })
}), deleteCard);

cardsRouter.put('/cards/:cardId/likes', celebrate({
  body: Joi.object().keys({
    user: Joi.object().keys({
      _id: Joi.string().hex().required()
    })
  }),
  params: Joi.object().keys({
    cardId: Joi.string().hex().required()
  })
}), likeCard);

cardsRouter.delete('/cards/:cardId/likes', celebrate({
  body: Joi.object().keys({
    user: Joi.object().keys({
      _id: Joi.string().hex().required()
    })
  }),
  params: Joi.object().keys({
    cardId: Joi.string().hex().required()
  })
}), dislikeCard);

module.exports = cardsRouter;
