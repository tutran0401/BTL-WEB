import Joi from 'joi';

export const createEventSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Title must be at least 5 characters long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(20).required().messages({
    'string.min': 'Description must be at least 20 characters long',
    'any.required': 'Description is required'
  }),
  location: Joi.string().min(5).required().messages({
    'string.min': 'Location must be at least 5 characters long',
    'any.required': 'Location is required'
  }),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Start date is required',
    'date.base': 'Start date must be a valid date'
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required'
  }),
  category: Joi.string().valid(
    'TREE_PLANTING',
    'CLEANING',
    'CHARITY',
    'DIGITAL_LITERACY',
    'EDUCATION',
    'HEALTHCARE',
    'COMMUNITY',
    'OTHER'
  ).required().messages({
    'any.required': 'Category is required',
    'any.only': 'Invalid category'
  }),
  maxParticipants: Joi.number().integer().min(1).optional().messages({
    'number.min': 'Max participants must be at least 1'
  }),
  imageUrl: Joi.string().allow('').optional().messages({
    'string.base': 'Image URL must be a string'
  })
});

export const updateEventSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(20).optional(),
  location: Joi.string().min(5).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  category: Joi.string().valid(
    'TREE_PLANTING',
    'CLEANING',
    'CHARITY',
    'DIGITAL_LITERACY',
    'EDUCATION',
    'HEALTHCARE',
    'COMMUNITY',
    'OTHER'
  ).optional(),
  maxParticipants: Joi.number().integer().min(1).optional(),
  imageUrl: Joi.string().uri().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

