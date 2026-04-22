
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Tour de Russie API',
    version: '1.0.0',
    description: 'API documentation for the Tour de Russie cycling event registration platform',
    contact: {
      name: 'Tour de Russie',
      url: 'https://tourderussie.ru',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://tourderussie.ru',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/auth/login or /api/auth/register',
      },
      cmsBearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/cms/auth/login',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          patronymic: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female'] },
          phone: { type: 'string' },
          country: { type: 'string' },
          region: { type: 'string' },
          city: { type: 'string' },
          participation_type: { type: 'string' },
          team_name: { type: 'string' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          status: { type: 'string', enum: ['upcoming', 'completed', 'cancelled'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      EventDistance: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          event_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          distance_km: { type: 'number' },
          price_kopecks: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Registration: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          event_id: { type: 'string', format: 'uuid' },
          distance_id: { type: 'string', format: 'uuid' },
          payment_status: { type: 'string', enum: ['pending', 'paid', 'refunded'] },
          bib_number: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      HealthCertificate: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          issued_date: { type: 'string', format: 'date' },
          expiry_date: { type: 'string', format: 'date' },
          document_url: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'active', 'expired'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CorporateAccount: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          company_full_name: { type: 'string' },
          company_short_name: { type: 'string' },
          inn: { type: 'string' },
          kpp: { type: 'string' },
          ogrn: { type: 'string' },
          bank_details: { type: 'object' },
          postal_address: { type: 'string' },
          coordinator_name: { type: 'string' },
          coordinator_phone: { type: 'string' },
          coordinator_email: { type: 'string', format: 'email' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CorporateMember: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          corporate_account_id: { type: 'string', format: 'uuid' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          patronymic: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          position: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      EmergencyContact: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          phone: { type: 'string' },
          relationship: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CorporateApplication: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          company_name: { type: 'string' },
          contact_person: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          participants_count: { type: 'integer' },
          message: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Result: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          registration_id: { type: 'string', format: 'uuid' },
          event_id: { type: 'string', format: 'uuid' },
          distance_id: { type: 'string', format: 'uuid' },
          place: { type: 'integer' },
          finish_time: { type: 'string' },
          category: { type: 'string' },
          category_place: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CmsPage: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string' },
          title: { type: 'string' },
          is_published: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CmsBlock: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          page_id: { type: 'string', format: 'uuid' },
          block_type: { type: 'string' },
          sort_order: { type: 'integer' },
          data: { type: 'object' },
          is_visible: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CmsNews: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string' },
          title: { type: 'string' },
          is_published: { type: 'boolean' },
          featured_image: { type: 'string' },
          excerpt: { type: 'string' },
          published_at: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CmsAsset: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          filename: { type: 'string' },
          original_name: { type: 'string' },
          mime_type: { type: 'string' },
          size: { type: 'integer' },
          url: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  tags: [
    { name: 'Health', description: 'Health check endpoint' },
    { name: 'Auth', description: 'Authentication and registration' },
    { name: 'Profile', description: 'User profile management' },
    { name: 'Events', description: 'Public event listings' },
    { name: 'Registrations', description: 'Event registration management' },
    { name: 'Health Certificates', description: 'Medical certificate management' },
    { name: 'Corporate', description: 'Corporate applications (public)' },
    { name: 'Corporate Accounts', description: 'Corporate account management' },
    { name: 'Admin', description: 'Admin and organizer panel' },
    { name: 'CMS Auth', description: 'CMS authentication' },
    { name: 'CMS', description: 'CMS content management' },
  ],
};

const paths: Record<string, object> = {
  '/health': { get: { tags: ['Health'], summary: 'Health check', responses: { '200': { description: 'OK' } } } },

  // Auth
  '/api/auth/send-verification-code': { post: { tags: ['Auth'], summary: 'Send verification code', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } } }, responses: { '200': { description: 'OK' } } } },
  '/api/auth/verify-code': { post: { tags: ['Auth'], summary: 'Verify code', responses: { '200': { description: 'OK' } } } },
  '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register', responses: { '200': { description: 'OK' } } } },
  '/api/auth/login': { post: { tags: ['Auth'], summary: 'Login', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '200': { description: 'OK' } } } },
  '/api/auth/logout': { post: { tags: ['Auth'], summary: 'Logout', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/auth/me': { get: { tags: ['Auth'], summary: 'Get current user', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/auth/refresh': { post: { tags: ['Auth'], summary: 'Refresh token', responses: { '200': { description: 'OK' } } } },
  '/api/auth/send-password-reset-code': { post: { tags: ['Auth'], summary: 'Send password reset code', responses: { '200': { description: 'OK' } } } },
  '/api/auth/reset-password': { post: { tags: ['Auth'], summary: 'Reset password', responses: { '200': { description: 'OK' } } } },

  // Yandex Auth
  '/api/auth/yandex/url': { get: { tags: ['Auth'], summary: 'Get Yandex OAuth URL', responses: { '200': { description: 'OK' } } } },
  '/api/auth/yandex/callback': { get: { tags: ['Auth'], summary: 'Yandex OAuth callback', responses: { '302': { description: 'Redirect' } } } },
  '/api/auth/yandex/exchange': { post: { tags: ['Auth'], summary: 'Exchange Yandex token', responses: { '200': { description: 'OK' } } } },
  '/api/auth/yandex/link': { post: { tags: ['Auth'], summary: 'Link Yandex account', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/auth/yandex/unlink': { delete: { tags: ['Auth'], summary: 'Unlink Yandex account', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/auth/yandex/status': { get: { tags: ['Auth'], summary: 'Yandex link status', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },

  // Events
  '/api/events': { get: { tags: ['Events'], summary: 'Get all events', responses: { '200': { description: 'OK' } } } },
  '/api/events/{id}': { get: { tags: ['Events'], summary: 'Get event by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/events/{id}/distances': { get: { tags: ['Events'], summary: 'Get event distances', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/events/{id}/results': { get: { tags: ['Events'], summary: 'Get event results', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },

  // Profile
  '/api/profile': {
    get: { tags: ['Profile'], summary: 'Get profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    put: { tags: ['Profile'], summary: 'Update profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/profile/emergency-contacts': {
    get: { tags: ['Profile'], summary: 'Get emergency contacts', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    post: { tags: ['Profile'], summary: 'Create emergency contact', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/profile/emergency-contacts/{id}': {
    put: { tags: ['Profile'], summary: 'Update emergency contact', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['Profile'], summary: 'Delete emergency contact', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },

  // Registrations
  '/api/registrations': {
    get: { tags: ['Registrations'], summary: 'Get user registrations', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    post: { tags: ['Registrations'], summary: 'Create registration', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/registrations/{id}': {
    get: { tags: ['Registrations'], summary: 'Get registration by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    put: { tags: ['Registrations'], summary: 'Update registration', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },

  // Payments
  '/api/payments': {
    post: { tags: ['Payments'], summary: 'Create payment', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    get: { tags: ['Payments'], summary: 'Get user payments', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/payments/{id}': { get: { tags: ['Payments'], summary: 'Get payment by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/payments/robokassa/result': { post: { tags: ['Payments'], summary: 'Robokassa result webhook', responses: { '200': { description: 'OK' } } } },
  '/api/payments/robokassa/success': { get: { tags: ['Payments'], summary: 'Robokassa success redirect', responses: { '302': { description: 'Redirect' } } } },
  '/api/payments/robokassa/fail': { get: { tags: ['Payments'], summary: 'Robokassa fail redirect', responses: { '302': { description: 'Redirect' } } } },

  // Health Certificates
  '/api/health-certificates': {
    get: { tags: ['Health Certificates'], summary: 'Get user certificates', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    post: { tags: ['Health Certificates'], summary: 'Create certificate', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/health-certificates/upload': { post: { tags: ['Health Certificates'], summary: 'Upload document', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/health-certificates/{id}': {
    get: { tags: ['Health Certificates'], summary: 'Get certificate by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    put: { tags: ['Health Certificates'], summary: 'Update certificate', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['Health Certificates'], summary: 'Delete certificate', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },

  // Contact
  '/api/contact': {
    post: { tags: ['Contact'], summary: 'Submit contact request', responses: { '200': { description: 'OK' } } },
    get: { tags: ['Contact'], summary: 'Get all contact requests (admin)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },

  // Promo Codes
  '/api/promo-codes/validate': { post: { tags: ['Promo Codes'], summary: 'Validate promo code', responses: { '200': { description: 'OK' } } } },
  '/api/promo-codes/use': { post: { tags: ['Promo Codes'], summary: 'Use promo code', responses: { '200': { description: 'OK' } } } },
  '/api/promo-codes': {
    get: { tags: ['Promo Codes'], summary: 'Get all promo codes', responses: { '200': { description: 'OK' } } },
    post: { tags: ['Promo Codes'], summary: 'Create promo code', responses: { '200': { description: 'OK' } } },
  },
  '/api/promo-codes/{id}': {
    put: { tags: ['Promo Codes'], summary: 'Update promo code', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['Promo Codes'], summary: 'Delete promo code', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },

  // Media Gallery
  '/api/media-gallery': {
    get: { tags: ['Media Gallery'], summary: 'Get gallery items', responses: { '200': { description: 'OK' } } },
    post: { tags: ['Media Gallery'], summary: 'Add gallery item', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/media-gallery/upload': { post: { tags: ['Media Gallery'], summary: 'Upload gallery file', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/media-gallery/{id}': { delete: { tags: ['Media Gallery'], summary: 'Delete gallery item', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },

  // Corporate
  '/api/corporate/applications': { post: { tags: ['Corporate'], summary: 'Submit corporate application', responses: { '200': { description: 'OK' } } } },

  // Corporate Accounts
  '/api/corporate-accounts': {
    post: { tags: ['Corporate Accounts'], summary: 'Create corporate account', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    get: { tags: ['Corporate Accounts'], summary: 'Get corporate account', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    put: { tags: ['Corporate Accounts'], summary: 'Update corporate account', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/corporate-accounts/members': {
    post: { tags: ['Corporate Accounts'], summary: 'Add member', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    get: { tags: ['Corporate Accounts'], summary: 'Get members', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/corporate-accounts/members/{id}': {
    get: { tags: ['Corporate Accounts'], summary: 'Get member by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    put: { tags: ['Corporate Accounts'], summary: 'Update member', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['Corporate Accounts'], summary: 'Delete member', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },

  // Admin
  '/api/admin/participants': { get: { tags: ['Admin'], summary: 'Get all participants', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/participants/{id}': { get: { tags: ['Admin'], summary: 'Get participant by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/registrations': { get: { tags: ['Admin'], summary: 'Get all registrations', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/registrations/{id}': { put: { tags: ['Admin'], summary: 'Update registration', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/registrations/{id}/assign-bib': { post: { tags: ['Admin'], summary: 'Assign bib number', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/registrations/{id}/move-to-group-a': { post: { tags: ['Admin'], summary: 'Move to group A', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/events/{eventId}/auto-assign-all': { post: { tags: ['Admin'], summary: 'Auto assign all bibs', security: [{ bearerAuth: [] }], parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/health-certificates': { get: { tags: ['Admin'], summary: 'Get all health certificates', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/health-certificates/{id}': { put: { tags: ['Admin'], summary: 'Update health certificate', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/corporate-applications': { get: { tags: ['Admin'], summary: 'Get all corporate applications', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/corporate-applications/{id}': { put: { tags: ['Admin'], summary: 'Update corporate application', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/events': { post: { tags: ['Admin'], summary: 'Create event', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/events/{id}': {
    put: { tags: ['Admin'], summary: 'Update event', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['Admin'], summary: 'Delete event', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },
  '/api/admin/events/{eventId}/distances': { post: { tags: ['Admin'], summary: 'Create distance', security: [{ bearerAuth: [] }], parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/distances/{id}': {
    put: { tags: ['Admin'], summary: 'Update distance', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['Admin'], summary: 'Delete distance', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },
  '/api/admin/results': { post: { tags: ['Admin'], summary: 'Create result', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/admin/results/{id}': {
    put: { tags: ['Admin'], summary: 'Update result', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['Admin'], summary: 'Delete result', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },
  '/api/admin/users/{userId}/roles': {
    get: { tags: ['Admin'], summary: 'Get user roles', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    post: { tags: ['Admin'], summary: 'Add user role', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },
  '/api/admin/users/{userId}/roles/{role}': { delete: { tags: ['Admin'], summary: 'Remove user role', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'role', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },

  // Analytics
  '/api/analytics/overview': { get: { tags: ['Analytics'], summary: 'Overview stats', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/analytics/geography': { get: { tags: ['Analytics'], summary: 'Geography stats', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/analytics/activity': { get: { tags: ['Analytics'], summary: 'Activity stats', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/analytics/events': { get: { tags: ['Analytics'], summary: 'Event analytics', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/analytics/finance': { get: { tags: ['Analytics'], summary: 'Finance stats', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/analytics/export': { get: { tags: ['Analytics'], summary: 'Export CSV', security: [{ bearerAuth: [] }], responses: { '200': { description: 'CSV file' } } } },

  // CMS Auth
  '/api/cms/auth/login': { post: { tags: ['CMS Auth'], summary: 'CMS login', responses: { '200': { description: 'OK' } } } },
  '/api/cms/auth/change-password': { post: { tags: ['CMS Auth'], summary: 'Change CMS password', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },

  // CMS
  '/api/cms/page/{slug}': { get: { tags: ['CMS'], summary: 'Get page by slug', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
  '/api/cms/admin/pages': {
    get: { tags: ['CMS'], summary: 'Get all pages', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    post: { tags: ['CMS'], summary: 'Create page', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/cms/admin/pages/{id}': {
    get: { tags: ['CMS'], summary: 'Get page by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    put: { tags: ['CMS'], summary: 'Update page', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['CMS'], summary: 'Delete page', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },
  '/api/cms/admin/blocks': { post: { tags: ['CMS'], summary: 'Create block', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/cms/admin/blocks/{id}': {
    put: { tags: ['CMS'], summary: 'Update block', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['CMS'], summary: 'Delete block', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },
  '/api/cms/admin/blocks/reorder': { post: { tags: ['CMS'], summary: 'Reorder blocks', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  '/api/cms/admin/news': {
    get: { tags: ['CMS'], summary: 'Get all news', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    post: { tags: ['CMS'], summary: 'Create news', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/cms/admin/news/{id}': {
    get: { tags: ['CMS'], summary: 'Get news by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    put: { tags: ['CMS'], summary: 'Update news', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    delete: { tags: ['CMS'], summary: 'Delete news', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
  },
  '/api/cms/admin/assets': {
    get: { tags: ['CMS'], summary: 'Get all assets', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    post: { tags: ['CMS'], summary: 'Upload asset', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
  },
  '/api/cms/admin/assets/{id}': { delete: { tags: ['CMS'], summary: 'Delete asset', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
};

const swaggerSpec = { ...swaggerDefinition, paths };

export default swaggerSpec;
