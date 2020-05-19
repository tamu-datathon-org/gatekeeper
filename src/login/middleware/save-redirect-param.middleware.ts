export function saveRedirectParam(req, res, next) {
  req.session.redirect = req.query.redirect;
  next();
}