export function upperCaseFirst(s) {
  if (s.length === 0) {
    return '';
  }

  return s.charAt(0).toUpperCase() + s.substr(1);
}
