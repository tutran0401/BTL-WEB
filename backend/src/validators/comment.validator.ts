import Joi from 'joi';

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Content cannot be empty',
    'string.max': 'Content must not exceed 1000 characters',
    'any.required': 'Content is required'
  })
});

