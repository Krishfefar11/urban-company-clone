import swaggerJsdoc from 'swagger-jsdoc'

const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UrbanClone API',
      version: '1.0.0',
      description:
        'REST API for UrbanClone — on-demand home services platform.\n\n' +
        '**Auth:** All protected routes require a Firebase ID token in the `Authorization: Bearer <token>` header.\n\n' +
        '**Roles:** `user` | `professional` | `admin`',
      contact: { name: 'UrbanClone Dev', email: 'dev@urbanclone.in' },
    },
    servers: [
      { url: 'http://localhost:5001/api', description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Firebase ID Token',
          description: 'Firebase ID token from `auth.currentUser.getIdToken()`',
        },
      },
      schemas: {
        // ── Shared ─────────────────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total:      { type: 'integer', example: 84 },
            page:       { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        // ── User ───────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            _id:           { type: 'string', example: '64abc123' },
            name:          { type: 'string', example: 'Krish Patel' },
            email:         { type: 'string', format: 'email' },
            phone:         { type: 'string', example: '9876543210' },
            role:          { type: 'string', enum: ['user', 'professional', 'admin'] },
            city:          { type: 'string', example: 'Ahmedabad' },
            avatar:        { type: 'string', example: 'https://res.cloudinary.com/…' },
            walletBalance: { type: 'number', example: 250 },
            phoneVerified: { type: 'boolean', example: false },
            isActive:      { type: 'boolean', example: true },
            createdAt:     { type: 'string', format: 'date-time' },
          },
        },
        Address: {
          type: 'object',
          required: ['line1', 'city', 'pincode'],
          properties: {
            _id:       { type: 'string' },
            label:     { type: 'string', example: 'Home' },
            type:      { type: 'string', enum: ['home', 'work', 'other'] },
            line1:     { type: 'string', example: '4th floor, Iscon Elegance' },
            line2:     { type: 'string', example: 'Near ISKON Temple' },
            city:      { type: 'string', example: 'Ahmedabad' },
            pincode:   { type: 'string', example: '380015' },
            isDefault: { type: 'boolean' },
          },
        },
        // ── Service ────────────────────────────────────────────────────
        Service: {
          type: 'object',
          properties: {
            _id:         { type: 'string' },
            title:       { type: 'string', example: 'Full Home Deep Clean' },
            slug:        { type: 'string', example: 'full-home-deep-clean' },
            category:    { type: 'string', example: 'cleaning' },
            description: { type: 'string' },
            icon:        { type: 'string', example: '🧹' },
            images:      { type: 'array', items: { type: 'string' } },
            includes:    { type: 'array', items: { type: 'string' } },
            pricingTiers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name:  { type: 'string', example: '1BHK' },
                  price: { type: 'number', example: 499 },
                },
              },
            },
            rating:      { type: 'number', example: 4.8 },
            reviewCount: { type: 'integer', example: 142 },
            isActive:    { type: 'boolean' },
            city:        { type: 'string', example: 'Ahmedabad' },
          },
        },
        // ── Booking ────────────────────────────────────────────────────
        Booking: {
          type: 'object',
          properties: {
            _id:          { type: 'string' },
            user:         { $ref: '#/components/schemas/User' },
            service:      { $ref: '#/components/schemas/Service' },
            professional: { type: 'string', description: 'Professional ObjectId' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
            },
            scheduledAt: { type: 'string', format: 'date-time' },
            pricingTier: {
              type: 'object',
              properties: { name: { type: 'string' }, price: { type: 'number' } },
            },
            payment: {
              type: 'object',
              properties: {
                method: { type: 'string', enum: ['online', 'cash'] },
                status: { type: 'string', enum: ['pending', 'paid', 'refunded'] },
                amount: { type: 'number' },
                razorpayOrderId:   { type: 'string' },
                razorpayPaymentId: { type: 'string' },
              },
            },
            address: { $ref: '#/components/schemas/Address' },
            notes:   { type: 'string' },
          },
        },
        // ── Professional ───────────────────────────────────────────────
        Professional: {
          type: 'object',
          properties: {
            _id:         { type: 'string' },
            user:        { $ref: '#/components/schemas/User' },
            bio:         { type: 'string' },
            experience:  { type: 'integer', example: 3 },
            services:    { type: 'array', items: { type: 'string' } },
            city:        { type: 'string', example: 'Ahmedabad' },
            rating:      { type: 'number', example: 4.9 },
            totalJobs:   { type: 'integer', example: 128 },
            status:      { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            isAvailable: { type: 'boolean' },
          },
        },
        // ── Review ─────────────────────────────────────────────────────
        Review: {
          type: 'object',
          properties: {
            _id:          { type: 'string' },
            user:         { $ref: '#/components/schemas/User' },
            booking:      { type: 'string' },
            service:      { type: 'string' },
            professional: { type: 'string' },
            rating:       { type: 'integer', minimum: 1, maximum: 5 },
            comment:      { type: 'string' },
            tags:         { type: 'array', items: { type: 'string' } },
            createdAt:    { type: 'string', format: 'date-time' },
          },
        },
        // ── Message ────────────────────────────────────────────────────
        Message: {
          type: 'object',
          properties: {
            _id:       { type: 'string' },
            booking:   { type: 'string' },
            sender:    { $ref: '#/components/schemas/User' },
            text:      { type: 'string', example: 'On my way, ETA 10 mins!' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',          description: 'Firebase authentication & user registration' },
      { name: 'Users',         description: 'User profile, addresses, FCM tokens' },
      { name: 'Services',      description: 'Service catalogue (CRUD)' },
      { name: 'Bookings',      description: 'Booking creation, status, cancellation' },
      { name: 'Professionals', description: 'Professional profiles & applications' },
      { name: 'Reviews',       description: 'Service reviews & ratings' },
      { name: 'Payments',      description: 'Razorpay order creation, verification & promo codes' },
      { name: 'Wallet',        description: 'User wallet balance & transactions' },
      { name: 'Admin',         description: 'Admin-only stats & management' },
      { name: 'Upload',        description: 'Cloudinary image upload' },
      { name: 'Messages',      description: 'In-booking real-time chat messages' },
    ],
    paths: {
      // ════════════════════════════════════════════════════════════════
      // AUTH
      // ════════════════════════════════════════════════════════════════
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user after Firebase signup',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firebaseUid', 'name', 'email'],
                  properties: {
                    firebaseUid: { type: 'string' },
                    name:        { type: 'string', minLength: 2, maxLength: 60 },
                    email:       { type: 'string', format: 'email' },
                    phone:       { type: 'string', example: '9876543210' },
                    role:        { type: 'string', enum: ['user', 'professional'], default: 'user' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User created', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get authenticated user from token',
          responses: {
            200: { description: 'Authenticated user', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } } },
            401: { description: 'Invalid token' },
          },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // USERS
      // ════════════════════════════════════════════════════════════════
      '/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Get own profile',
          responses: {
            200: { description: 'User profile', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } } },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Update own profile (name, phone, city, avatar, addresses)',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name:      { type: 'string' },
                    phone:     { type: 'string' },
                    city:      { type: 'string' },
                    avatar:    { type: 'string' },
                    addresses: { type: 'array', items: { $ref: '#/components/schemas/Address' } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Updated user', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } } },
          },
        },
      },
      '/users/fcm-token': {
        post: {
          tags: ['Users'],
          summary: 'Save FCM device token for push notifications',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['token'], properties: { token: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'Token saved' }, 400: { description: 'Missing token' } },
        },
      },
      '/users/verify-phone': {
        patch: {
          tags: ['Users'],
          summary: 'Mark phone number as verified (call after Firebase Phone OTP)',
          responses: { 200: { description: 'phoneVerified set to true' } },
        },
      },
      '/users': {
        get: {
          tags: ['Users', 'Admin'],
          summary: 'List all users (admin only, paginated)',
          parameters: [
            { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',  in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or email' },
            { name: 'role',   in: 'query', schema: { type: 'string', enum: ['user', 'professional', 'admin'] } },
          ],
          responses: { 200: { description: 'Paginated users' }, 403: { description: 'Admins only' } },
        },
      },
      '/users/{id}/status': {
        patch: {
          tags: ['Users', 'Admin'],
          summary: 'Suspend or activate a user account (admin only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { isActive: { type: 'boolean' } } } } },
          },
          responses: { 200: { description: 'Updated user' }, 403: { description: 'Admins only' } },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // SERVICES
      // ════════════════════════════════════════════════════════════════
      '/services': {
        get: {
          tags: ['Services'],
          summary: 'List services (filterable, paginated)',
          security: [],
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'search',   in: 'query', schema: { type: 'string' } },
            { name: 'city',     in: 'query', schema: { type: 'string' } },
            { name: 'sort',     in: 'query', schema: { type: 'string', enum: ['rating', 'price', 'popular'] } },
            { name: 'page',     in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',    in: 'query', schema: { type: 'integer', default: 24 } },
          ],
          responses: {
            200: {
              description: 'Paginated service list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success:    { type: 'boolean' },
                      services:   { type: 'array', items: { $ref: '#/components/schemas/Service' } },
                      total:      { type: 'integer' },
                      page:       { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Services', 'Admin'],
          summary: 'Create a new service (admin only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'category'],
                  properties: {
                    title:       { type: 'string' },
                    category:    { type: 'string' },
                    description: { type: 'string' },
                    icon:        { type: 'string' },
                    images:      { type: 'array', items: { type: 'string' } },
                    pricingTiers: {
                      type: 'array',
                      items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' } } },
                    },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Service created' }, 403: { description: 'Admins only' } },
        },
      },
      '/services/{id}': {
        get: {
          tags: ['Services'],
          summary: 'Get a single service by ID',
          security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Service detail', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, service: { $ref: '#/components/schemas/Service' } } } } } }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Services', 'Admin'],
          summary: 'Update a service (admin only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Service' } } } },
          responses: { 200: { description: 'Updated service' } },
        },
        delete: {
          tags: ['Services', 'Admin'],
          summary: 'Soft-delete a service (sets isActive = false, admin only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Service deactivated' } },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // BOOKINGS
      // ════════════════════════════════════════════════════════════════
      '/bookings': {
        post: {
          tags: ['Bookings'],
          summary: 'Create a booking (auto-assigns professional)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['serviceId', 'scheduledAt', 'address', 'pricingTier'],
                  properties: {
                    serviceId:   { type: 'string' },
                    scheduledAt: { type: 'string', format: 'date-time' },
                    pricingTier: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' } } },
                    address:     { $ref: '#/components/schemas/Address' },
                    notes:       { type: 'string' },
                    paymentMethod: { type: 'string', enum: ['online', 'cash'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Booking created', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, booking: { $ref: '#/components/schemas/Booking' } } } } } },
            400: { description: 'Validation error' },
          },
        },
      },
      '/bookings/my': {
        get: {
          tags: ['Bookings'],
          summary: 'Get current user\'s bookings (paginated)',
          parameters: [
            { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',  in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'User bookings' } },
        },
      },
      '/bookings/{id}': {
        get: {
          tags: ['Bookings'],
          summary: 'Get booking by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Booking detail' }, 404: { description: 'Not found' } },
        },
      },
      '/bookings/{id}/status': {
        patch: {
          tags: ['Bookings'],
          summary: 'Update booking status (professional)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['on_the_way', 'in_progress', 'completed'] } } } } },
          },
          responses: { 200: { description: 'Status updated' }, 403: { description: 'Forbidden' } },
        },
      },
      '/bookings/{id}/cancel': {
        post: {
          tags: ['Bookings'],
          summary: 'Cancel a booking (triggers refund if paid)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } } },
          responses: { 200: { description: 'Booking cancelled & refund initiated' } },
        },
      },
      '/bookings/{id}/reschedule': {
        patch: {
          tags: ['Bookings'],
          summary: 'Reschedule a booking',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['scheduledAt'], properties: { scheduledAt: { type: 'string', format: 'date-time' } } } } } },
          responses: { 200: { description: 'Booking rescheduled' } },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // PROFESSIONALS
      // ════════════════════════════════════════════════════════════════
      '/professionals': {
        get: {
          tags: ['Professionals'],
          summary: 'List professionals (filterable by status, city, service)',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
            { name: 'city',   in: 'query', schema: { type: 'string' } },
            { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
          ],
          responses: { 200: { description: 'Professional list' } },
        },
      },
      '/professionals/apply': {
        post: {
          tags: ['Professionals'],
          summary: 'Apply as a professional (creates Professional record + sets user role)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'phone', 'city', 'services'],
                  properties: {
                    name:       { type: 'string' },
                    email:      { type: 'string', format: 'email' },
                    phone:      { type: 'string' },
                    bio:        { type: 'string' },
                    experience: { type: 'integer' },
                    city:       { type: 'string' },
                    services:   { type: 'array', items: { type: 'string' } },
                    areas:      { type: 'array', items: { type: 'string' } },
                    availability: {
                      type: 'object',
                      properties: {
                        mon: { type: 'boolean' }, tue: { type: 'boolean' }, wed: { type: 'boolean' },
                        thu: { type: 'boolean' }, fri: { type: 'boolean' }, sat: { type: 'boolean' }, sun: { type: 'boolean' },
                        startTime: { type: 'string', example: '08:00' },
                        endTime:   { type: 'string', example: '18:00' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Application submitted' }, 409: { description: 'Already applied' } },
        },
      },
      '/professionals/me': {
        get: {
          tags: ['Professionals'],
          summary: 'Get own professional profile',
          responses: { 200: { description: 'Professional profile' } },
        },
        put: {
          tags: ['Professionals'],
          summary: 'Update own professional profile',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Professional' } } } },
          responses: { 200: { description: 'Updated profile' } },
        },
      },
      '/professionals/{id}': {
        patch: {
          tags: ['Professionals', 'Admin'],
          summary: 'Approve or reject a professional application (admin only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['approved', 'rejected'] }, rejectionReason: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'Professional status updated' } },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // REVIEWS
      // ════════════════════════════════════════════════════════════════
      '/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Submit a review for a completed booking',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['booking', 'professional', 'service', 'rating'],
                  properties: {
                    booking:      { type: 'string' },
                    professional: { type: 'string' },
                    service:      { type: 'string' },
                    rating:       { type: 'integer', minimum: 1, maximum: 5 },
                    comment:      { type: 'string', maxLength: 300 },
                    tags:         { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Review submitted' }, 409: { description: 'Already reviewed' } },
        },
      },
      '/reviews/{serviceId}': {
        get: {
          tags: ['Reviews'],
          summary: 'Get reviews for a service',
          security: [],
          parameters: [
            { name: 'serviceId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page',      in: 'query', schema: { type: 'integer', default: 1 } },
          ],
          responses: { 200: { description: 'Reviews list' } },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // PAYMENTS
      // ════════════════════════════════════════════════════════════════
      '/payments/create-order': {
        post: {
          tags: ['Payments'],
          summary: 'Create a Razorpay order for a booking',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['amount', 'bookingId'],
                  properties: {
                    amount:    { type: 'number', description: 'Amount in INR (not paise)', example: 699 },
                    bookingId: { type: 'string' },
                    currency:  { type: 'string', default: 'INR' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Razorpay order created',
              content: { 'application/json': { schema: { type: 'object', properties: { orderId: { type: 'string' }, amount: { type: 'integer', description: 'Amount in paise' }, currency: { type: 'string' }, keyId: { type: 'string' } } } } },
            },
          },
        },
      },
      '/payments/verify': {
        post: {
          tags: ['Payments'],
          summary: 'Verify Razorpay payment signature (HMAC-SHA256)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'bookingId'],
                  properties: {
                    razorpay_order_id:   { type: 'string' },
                    razorpay_payment_id: { type: 'string' },
                    razorpay_signature:  { type: 'string' },
                    bookingId:           { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Payment verified, booking confirmed' }, 400: { description: 'Invalid signature' } },
        },
      },
      '/payments/apply-promo': {
        post: {
          tags: ['Payments'],
          summary: 'Validate a promo code against a booking amount',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['code', 'amount'], properties: { code: { type: 'string' }, amount: { type: 'number' }, bookingId: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'Discount applied', content: { 'application/json': { schema: { type: 'object', properties: { discount: { type: 'number' }, finalAmount: { type: 'number' }, promoId: { type: 'string' } } } } } }, 400: { description: 'Invalid/expired code' } },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // WALLET
      // ════════════════════════════════════════════════════════════════
      '/wallet/balance': {
        get: {
          tags: ['Wallet'],
          summary: 'Get user wallet balance',
          responses: { 200: { description: 'Balance', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, balance: { type: 'number', example: 250 } } } } } } },
        },
      },
      '/wallet/transactions': {
        get: {
          tags: ['Wallet'],
          summary: 'Get wallet transaction history (paginated)',
          parameters: [
            { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'Transaction list' } },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // ADMIN
      // ════════════════════════════════════════════════════════════════
      '/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Platform-wide stats (admin only)',
          responses: {
            200: {
              description: 'Stats dashboard data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      totalUsers:     { type: 'integer' },
                      totalPros:      { type: 'integer' },
                      totalBookings:  { type: 'integer' },
                      totalRevenue:   { type: 'number' },
                      pendingApprovals: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/admin/bookings': {
        get: {
          tags: ['Admin'],
          summary: 'All bookings with filters (admin only)',
          parameters: [
            { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'All bookings' } },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // UPLOAD
      // ════════════════════════════════════════════════════════════════
      '/upload': {
        post: {
          tags: ['Upload'],
          summary: 'Upload an image to Cloudinary (max 5 MB)',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image'],
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'Image file (jpg/png/webp, max 5 MB)' },
                    folder: { type: 'string', default: 'urbanclone', description: 'Cloudinary folder' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Upload successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success:  { type: 'boolean' },
                      url:      { type: 'string', example: 'https://res.cloudinary.com/dopc26kti/image/upload/v1/urbanclone/abc123.webp' },
                      publicId: { type: 'string', example: 'urbanclone/abc123' },
                    },
                  },
                },
              },
            },
            400: { description: 'No file provided or file too large' },
            500: { description: 'Cloudinary upload failed' },
          },
        },
      },

      // ════════════════════════════════════════════════════════════════
      // MESSAGES (in-booking chat)
      // ════════════════════════════════════════════════════════════════
      '/messages/{bookingId}': {
        get: {
          tags: ['Messages'],
          summary: 'Get all messages for a booking',
          parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Message history',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success:  { type: 'boolean' },
                      messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Messages'],
          summary: 'Send a message in a booking chat',
          parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['text'], properties: { text: { type: 'string', maxLength: 500 } } } } },
          },
          responses: { 201: { description: 'Message sent, also emitted via Socket.io' } },
        },
      },
    },
  },
  apis: [],
})

export default spec
