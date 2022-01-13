const Card = require('../models/card');
const BadRequestError = require('../middleware/errors/badRequestError');
const NotFoundError  = require('../middleware/errors/notFoundError');

const getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((card) => {
      if (!card) {
        throw new Error();
      }
      res.send({ data: card })
    })
    .catch(err => next(err));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => {
      if (!card) {
        throw new Error();
      }
      res.send({ data: card })
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Bad request'));
      } else {
        next(err);
      }
    });
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Card not found');
      }
      if (!card.owner.equals(req.user._id)) {
        const err = new Error('Forbidden');
        err.statusCode = 403;
        throw err;
      }
      Card.deleteOne(card)
      .then(() => res.send({ data: card }))
    })
    .catch(err => next(err));
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Card not found');
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Invalid card'));
      } else {
        next(err);
      }
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      next(new BadRequestError('Invalid card'));
    } else {
      next(err);
    }
  });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard
};
