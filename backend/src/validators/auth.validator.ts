import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  fullName: Joi.string().min(2).required().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'any.required': 'Full name is required'
  }),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional().messages({
    'string.pattern.base': 'Phone must be 10-11 digits'
  }),
  role: Joi.string().valid('VOLUNTEER', 'EVENT_MANAGER', 'ADMIN').default('VOLUNTEER')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

