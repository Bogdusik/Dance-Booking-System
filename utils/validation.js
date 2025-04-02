exports.isValidId = id =>
  typeof id === 'string' && id.trim().length > 0;

exports.isEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.trimObject = obj =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value
    ])
  );