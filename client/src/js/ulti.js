const ulti = {
  /**
	 * Check if the object is empty
	 * @param {Object} obj - The object to be checked
	 */
  isEmpty(obj) {
    return Object.getOwnPropertyNames(obj).length === 0;
  },
  /**
	 * Capitalize a string
	 * @param {String} text - The string to be capitalized
	 */
  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.substr(1);
  }
};

export default ulti;
