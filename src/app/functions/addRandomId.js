export default function addRandomId(str) {
    const suffix = '-' + Math.random().toString(36).substring(2, 6);
    return str + suffix;
  }