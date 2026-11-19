const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseDate = value => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  if (!match) return null;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatPrice = value => {
  const amount = parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  if (Number.isNaN(amount)) return '';
  return `£${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
};

const formatClass = cls => {
  const date = parseDate(cls.date);
  return {
    ...cls,
    day: date ? String(date.getUTCDate()) : '',
    month: date ? MONTHS[date.getUTCMonth()] : '',
    weekday: date ? WEEKDAYS[date.getUTCDay()] : '',
    dateLabel: date
      ? `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
      : cls.date,
    priceLabel: formatPrice(cls.price)
  };
};

const byDateTime = (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

const initials = name =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

const summariseCourse = (course, classes, index) => {
  const own = classes.filter(cls => cls.courseId === course._id).sort(byDateTime);
  const prices = own
    .map(cls => parseFloat(String(cls.price ?? '').replace(/[^\d.]/g, '')))
    .filter(price => !Number.isNaN(price));
  const next = own[0] ? formatClass(own[0]) : null;
  return {
    ...course,
    accent: (index % 6) + 1,
    classCount: own.length,
    classLabel: own.length === 1 ? '1 class' : `${own.length} classes`,
    fromPrice: prices.length ? formatPrice(Math.min(...prices)) : '',
    nextLabel: next ? next.dateLabel : '',
    nextShort: next ? `${next.day} ${next.month}` : ''
  };
};

module.exports = { formatClass, formatPrice, byDateTime, initials, summariseCourse };
