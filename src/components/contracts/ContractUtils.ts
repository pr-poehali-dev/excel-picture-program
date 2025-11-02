export const isExpired = (expirationDate: string): boolean => {
  if (!expirationDate || expirationDate.trim() === '') return false;
  
  let expDate: Date;
  if (expirationDate.includes('.')) {
    const [day, month, year] = expirationDate.split(".");
    if (!day || !month || !year) return false;
    expDate = new Date(+year, +month - 1, +day);
  } else if (expirationDate.includes('-')) {
    expDate = new Date(expirationDate);
  } else {
    return false;
  }
  
  expDate.setHours(23, 59, 59, 999);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expDate < today;
};

export const isExpiringSoon = (expirationDate: string): boolean => {
  if (!expirationDate || expirationDate.trim() === '') return false;
  
  let expDate: Date;
  if (expirationDate.includes('.')) {
    const [day, month, year] = expirationDate.split(".");
    if (!day || !month || !year) return false;
    expDate = new Date(+year, +month - 1, +day);
  } else if (expirationDate.includes('-')) {
    expDate = new Date(expirationDate);
  } else {
    return false;
  }
  
  const today = new Date();
  const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiration > 0 && daysUntilExpiration <= 30;
};
