exports.isAuthenticated = (req, res, next) => {
  if (req.session?.user) return next();
  req.flash('error_msg', 'Please log in to continue');
  res.redirect('/auth/login');
};

exports.isOrganiser = (req, res, next) => {
  if (req.session?.user?.role === 'organiser') return next();
  req.flash('error_msg', 'Access denied');
  res.redirect('/');
};