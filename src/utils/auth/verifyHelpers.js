/**
 * Check if the user is verified or within the 24-hour grace period
 * @param {Object} user - The current user object from Redux
 * @returns {Boolean} - True if access should be allowed
 */
export const hasAccess = (user) => {
  if (!user) return false;
  if (user.isEmailVerified) return true;

  // 1. Legacy Support (Grandfathering)
  const LEGACY_CUTOFF = new Date("2026-01-01T00:00:00Z");
  const accountCreated = new Date(user.createdAt);

  if (accountCreated < LEGACY_CUTOFF) return true;

  // 2. 24-hour grace period for new users
  const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
  const accountAge = Date.now() - accountCreated.getTime();

  return accountAge < GRACE_PERIOD_MS;
};

/**
 * Get the remaining grace period in hours
 * @param {Object} user 
 * @returns {Number}
 */
export const getRemainingGraceHours = (user) => {
  if (!user || user.isEmailVerified) return 0;

  const LEGACY_CUTOFF = new Date("2026-01-01T00:00:00Z");
  const accountCreated = new Date(user.createdAt);

  if (accountCreated < LEGACY_CUTOFF) return -1; // -1 indicates legacy status (exempt)
  
  const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
  const accountAge = Date.now() - accountCreated.getTime();
  const remaining = GRACE_PERIOD_MS - accountAge;
  
  return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60)));
};
