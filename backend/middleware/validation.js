const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateRequired = (fields, data) => {
    for (const field of fields) {
        if (!data[field] || data[field].toString().trim() === '') {
            return { isValid: false, error: `${field} is required` };
        }
    }
    return { isValid: true };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateRequired
};