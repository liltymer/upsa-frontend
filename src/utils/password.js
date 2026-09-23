// Mirrors the server's password policy (upsa-backend app/services/password_policy.py).
// The server is the authority; this only gives students instant feedback.

const COMMON = new Set([
  "password", "password1", "password12", "password123", "password@123", "passw0rd", "p@ssw0rd", "p@ssword1",
  "12345678", "123456789", "1234567890", "12341234", "11111111", "00000000", "87654321", "qwerty123",
  "qwertyuiop", "qwerty12", "1q2w3e4r", "1qaz2wsx", "abc12345", "abcd1234", "iloveyou", "iloveyou1",
  "letmein1", "welcome1", "welcome123", "admin123", "admin@123", "changeme", "trustno1", "football1",
  "sunshine1", "princess1", "monkey123", "dragon123", "master123", "baseball1", "superman1",
  "upsa1234", "upsa2024", "upsa2025", "upsa2026", "upsa@123", "upsa@2026", "student1", "student123",
  "gradeiq1", "gradeiq123", "ghana123", "ghana1234", "accra123", "accra1234", "jesus123", "godislove",
]);

const personalWords = (email = "", name = "") => [
  ...email.split("@")[0].toLowerCase().split(/[^a-z]+/),
  ...name.toLowerCase().split(/[^a-z]+/),
].filter((word) => word.length >= 4);

/** Each rule with whether the password currently meets it. */
export function passwordChecks(password, { email, name } = {}) {
  const squashed = password.replace(/\s+/g, "").toLowerCase();
  const common = COMMON.has(squashed) || /^(.)\1+$/.test(squashed);
  const personal = personalWords(email, name).some((word) => squashed.includes(word));
  return [
    { id: "length", label: "At least 8 characters", met: password.length >= 8 && password.length <= 128 },
    { id: "case", label: "Upper and lower case letters", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { id: "number", label: "A number", met: /\d/.test(password) },
    { id: "symbol", label: "A symbol such as ! @ # or ?", met: /[^A-Za-z0-9]/.test(password) },
    { id: "unique", label: "Not a common password or your name", met: password.length > 0 && !common && !personal },
  ];
}

export const isStrongPassword = (password, context) => passwordChecks(password, context).every((c) => c.met);

/** 0 to 4, for the strength bar. */
export function passwordScore(password, context) {
  if (!password) return 0;
  const met = passwordChecks(password, context).filter((c) => c.met).length;
  if (met === 5) return password.length >= 12 ? 4 : 3;
  return met >= 3 ? 2 : 1;
}
