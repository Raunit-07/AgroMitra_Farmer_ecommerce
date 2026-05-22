export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let userRoles = req.user.roles || [req.user.user_metadata?.role || req.user.role];
    
    // Normalize: Treat 'farmer' and 'seller' as the same, handle 'both'
    const normalizedUserRoles = userRoles.flatMap(r => {
      if (r === 'farmer' || r === 'seller') return ['seller'];
      if (r === 'both') return ['buyer', 'seller', 'both'];
      return [r];
    });
    
    const normalizedAllowedRoles = roles.map(r => (r === 'farmer' || r === 'seller' ? 'seller' : r));

    const hasAccess = normalizedUserRoles.some(role => normalizedAllowedRoles.includes(role));

    if (!hasAccess) {
      return res.status(403).json({
        message: `Access denied: Required role one of [${roles.join(", ")}], but you have [${userRoles.join(", ")}]`,
      });
    }

    next();
  };
};
