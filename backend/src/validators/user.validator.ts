import Joi from 'joi';

// Validate user profile update
export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional().allow(''),
  avatar: Joi.string().uri().optional().allow(''),
});

// Validate user status update (Admin only)
export const updateUserStatusSchema = Joi.object({
  accountStatus: Joi.string().valid('ACTIVE', 'LOCKED', 'PENDING').required(),
});

// Validate user role update (Admin only)
export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('VOLUNTEER', 'EVENT_MANAGER', 'ADMIN').required(),
});

