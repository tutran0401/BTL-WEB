import Joi from 'joi';

export const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required().messages({
    'string.min': 'Content cannot be empty',
    'string.max': 'Content must not exceed 5000 characters',
    'any.required': 'Content is required'
  }),
  imageUrl: Joi.string().uri().optional().messages({
    'string.uri': 'Image URL must be a valid URL'
  })
});

