/**
 * Converts a pattern string into a regular expression that can be used to match file names.
 * The pattern string includes placeholders that are replaced with corresponding regex patterns.
 *
 * @param {string} pattern - The pattern string to be converted.
 * @returns {RegExp} - The resulting regular expression.
 */
export const convertPatternToRegExp = (pattern: string): RegExp => {
	const escapedPattern = pattern
		.replace(/{YYYY}/g, '\\d{4}') // Matches a four-digit year
		.replace(/{MM}/g, '(0[1-9]|1[0-2])') // Matches a two-digit month (01-12)
		.replace(/{DD}/g, '(0[1-9]|[12][0-9]|3[01])') // Matches a two-digit day (01-31)
		.replace(/{hh}/g, '(0[0-9]|1[0-9]|2[0-3])') // Matches a two-digit hour (00-23)
		.replace(/{mm}/g, '[0-5][0-9]') // Matches a two-digit minute (00-59)
		.replace(/{ss}/g, '[0-5][0-9]') // Matches a two-digit second (00-59)
		.replace(/{chunk}/g, '\\(\\d+\\)') // Matches the chunk number enclosed in parentheses
		.replace(/{hash}/g, '[a-zA-Z0-9]+-[a-zA-Z0-9]+'); // Matches the hash with alphanumeric characters and a dash

	return new RegExp(`^${escapedPattern}$`);
};
