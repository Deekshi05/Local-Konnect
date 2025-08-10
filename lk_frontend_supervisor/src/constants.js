export const USER_ROLES = {
  SUPERVISOR: 'SUPERVISOR',
  CUSTOMER: 'CUSTOMER',
  CONTRACTOR: 'CONTRACTOR',
  ADMIN: 'ADMIN'
};

export const TENDER_STATUS = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  ENDED: 'Ended',
  ASSIGNED: 'Assigned',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const VISIT_STATUS = {
  SCHEDULED: 'scheduled',
  PAYMENT_PENDING: 'payment_pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PROJECT_COMPLEXITY = {
  SIMPLE: 'simple',
  MEDIUM: 'medium',
  COMPLEX: 'complex'
};

export const TENDER_ASSISTANCE_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login/',
  REGISTER_SUPERVISOR: '/register/supervisor/',
  PROFILE: '/profile/',
  
  // Virtual Appointments
  VIRTUAL_APPOINTMENTS_CREATE: '/appointments/virtual/create/',
  VIRTUAL_APPOINTMENTS_SUPERVISOR: '/appointments/virtual/supervisor/',
  VIRTUAL_APPOINTMENT_UPDATE: '/appointments/virtual/',
  ASSESS_COMPLEXITY: '/appointments/virtual/', // + id + '/assess-complexity/'
  
  // Physical Visits
  PHYSICAL_VISITS_CREATE: '/visits/physical/create/',
  PHYSICAL_VISITS_SUPERVISOR: '/visits/physical/supervisor/',
  PHYSICAL_VISIT_UPDATE: '/visits/physical/',
  
  // Tender Assistance
  TENDER_ASSISTANCE_CREATE: '/tender-assistance/create/',
  TENDER_ASSISTANCE_SUPERVISOR: '/tender-assistance/supervisor/',
  TENDER_ASSISTANCE_DETAIL: '/tender-assistance/:id/',
  ASSISTED_TENDER_CREATE: '/tenders/assisted/create/',
  
  // Supervisor Services Management
  SUPERVISOR_SERVICES: '/supervisor/services/',
  
  // Tenders
  TENDERS_SUPERVISOR: '/tenders/supervisor/',
  
  // Services (General)
  SERVICES: '/services/',
  
  // Additional endpoints for complete workflow
  CUSTOMERS: '/customers/',
  CONTRACTORS: '/contractors/',
  REQUIREMENTS: '/requirements/'
};
