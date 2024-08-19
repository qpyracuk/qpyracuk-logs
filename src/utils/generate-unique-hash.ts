/**
 * Generates a unique hash based on the current timestamp and a random number.
 * The hash is a combination of a base-36 encoded timestamp and a random string.
 *
 * @returns {string} - A unique hash string.
 */
export const generateUniqueHash = (): string => {
	const timestamp = Date.now().toString(36); // Encode the current timestamp in base-36
	const randomNum = Math.random().toString(36).substring(2, 15); // Generate a random base-36 string
	const uniqueHash = `${timestamp}-${randomNum}`; // Combine the timestamp and random string with a dash
	return uniqueHash;
};
