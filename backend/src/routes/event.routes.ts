import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createEventSchema, updateEventSchema } from '../validators/event.validator';
import { Role } from '@prisma/client';
import { upload } from '../middleware/upload.middleware';


const router = Router();

// Public routes with optional authentication (để admin có thể filter theo status)
router.get('/', optionalAuthenticate, eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Authenticated routes
router.use(authenticate);

// Event Manager routes
router.post(
  '/',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  validate(createEventSchema),
  eventController.createEvent
);

router.put(
  '/:id',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.delete(
  '/:id',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  eventController.deleteEvent
);

// Admin routes
router.patch(
  '/:id/approve',
  authorize(Role.ADMIN),
  eventController.approveEvent
);

router.patch(
  '/:id/reject',
  authorize(Role.ADMIN),
  eventController.rejectEvent
);

// Image upload endpoint with error handling
router.post('/upload-image', authenticate, (req, res, next) => {
  console.log('📤 Upload request received');
  console.log('User:', req.user);
  
  // Multer middleware with error handling
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  try {
    console.log('📁 File received:', req.file);
    
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return the URL of uploaded file
    const imageUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
    
    console.log('✅ Upload successful:', imageUrl);
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;

