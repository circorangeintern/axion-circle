/**
 * CleanReport — API Data Types Reference
 */

/**
 * @typedef {'REPORTER' | 'ADMIN'} UserRole
 * @typedef {'OVERFLOW' | 'ILLEGAL_DUMPING' | 'BLOCKED_DRAIN' | 'STREET_LITTER' | 'RESIDENTIAL_DUMP' | 'COMMERCIAL_DUMP'} ReportCategory
 * @typedef {'REPORTED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED'} ReportStatus
 * @typedef {'ROUTINE' | 'VERY_URGENT' | 'CRITICAL'} ReportUrgency
 * @typedef {'PENDING' | 'APPROVED' | 'COLLECTED'} ClaimStatus
 */

/**
 * User object (from GET /auth/me or login response)
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} displayName
 * @property {UserRole} role
 * @property {number} creditBalance
 * @property {boolean} isAnonymous
 * @property {string} [avatarUrl]
 * @property {string} createdAt
 */

/**
 * Report object (from GET /reports or GET /reports/:id)
 * @typedef {Object} Report
 * @property {string} id
 * @property {string} referenceNumber - e.g. "CR-00042"
 * @property {string} reporterId
 * @property {string} [reporterName]
 * @property {string} photoUrl - Cloudinary URL
 * @property {string} [photoAfterUrl] - Resolution proof photo
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} [description] - max 200 chars
 * @property {ReportCategory} category
 * @property {ReportStatus} status
 * @property {ReportUrgency} urgency
 * @property {boolean} isAnonymous
 * @property {string} [areaName]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Status history entry (from report detail)
 * @typedef {Object} StatusHistory
 * @property {string} id
 * @property {ReportStatus} [oldStatus]
 * @property {ReportStatus} newStatus
 * @property {string} [note]
 * @property {string} changedByName
 * @property {string} createdAt
 */

/**
 * Notification object (from GET /notifications)
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {string} message
 * @property {boolean} isRead
 * @property {string} [reportId]
 * @property {string} sentAt
 */

/**
 * Credit transaction (from GET /credits/balance)
 * @typedef {Object} CreditTransaction
 * @property {string} id
 * @property {number} amount - positive = earned, negative = spent
 * @property {string} reason
 * @property {string} [reportId]
 * @property {string} createdAt
 */

/**
 * Reward (from GET /rewards)
 * @typedef {Object} Reward
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {number} creditsRequired
 * @property {number} quantityAvailable
 * @property {boolean} isActive
 * @property {string} [imageUrl]
 */

/**
 * Standard API response wrapper
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {*} data
 * @property {string} timestamp
 */
