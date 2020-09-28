const re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export default (emails) => {
  // map za svaki email vrati trimam email
  const invalidEmails = emails
    .split(",")
    .map((email) => email.trim())
    // test vrati false ako je email invalid
    .filter((email) => re.test(email) === false);

  if (invalidEmails.length) {
    return `These email are invalid: ${invalidEmails}`;
  }
  return;
};
