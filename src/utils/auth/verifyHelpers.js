/**
 * Check if the user is verified or within the 24-hour grace period
 * @param {Object} user - The current user object from Redux
 * @returns {Boolean} - True if access should be allowed
 */
export const hasAccess = (user) => {
  if (!user) return false;
  if (user.isEmailVerified || user.isVerified) return true;

  // 24-hour grace period
  const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
  const accountAge = Date.now() - new Date(user.createdAt).getTime();

  return accountAge < GRACE_PERIOD_MS;
};

/**
 * Get the remaining grace period in hours
 * @param {Object} user 
 * @returns {Number}
 */
export const getRemainingGraceHours = (user) => {
  if (!user || user.isEmailVerified || user.isVerified) return 0;
  
  const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  const remaining = GRACE_PERIOD_MS - accountAge;
  
  return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60)));
};
