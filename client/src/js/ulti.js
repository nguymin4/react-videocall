var ulti = {
	isEmpty(obj) {
		return Object.getOwnPropertyNames(obj).length === 0;
	},
	capitalize(text) {
		return text.charAt(0).toUpperCase() + text.substr(1);
	}
};

export default ulti;
