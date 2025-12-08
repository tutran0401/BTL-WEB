import Joi from 'joi';

// Validate registration note (optional)
export const updateRegistrationSchema = Joi.object({
  note: Joi.string().max(500).optional().allow(''),
});

// Validate registration status update
export const updateRegistrationStatusSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED').required(),
  note: Joi.string().max(500).optional().allow(''),
});

