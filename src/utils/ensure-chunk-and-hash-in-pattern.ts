/**
 * Ensures that the pattern string contains `{chunk}` and `{hash}` placeholders
 * before the file extension. If these placeholders are not present, they will be added.
 *
 * @param {string} pattern - The pattern string to be processed.
 * @returns {string} - The updated pattern string with `{chunk}` and `{hash}` included before the file extension.
 */
export const ensureChunkAndHashInPattern = (pattern: string): string => {
	// Find the last dot in the pattern, which separates the filename from the extension
	const lastDotIndex = pattern.lastIndexOf('.');

	if (lastDotIndex !== -1) {
		// Split the pattern into baseName (before the extension) and extension (including the dot)
		const baseName = pattern.substring(0, lastDotIndex);
		const extension = pattern.substring(lastDotIndex);

		// Check if {chunk} and {hash} are already in the baseName
		const hasChunk = baseName.includes('{chunk}');
		const hasHash = baseName.includes('{hash}');

		// Append {chunk} and {hash} if they are missing
		let updatedBaseName = baseName;
		if (!hasChunk) {
			updatedBaseName += '-{chunk}';
		}
		if (!hasHash) {
			updatedBaseName += '-{hash}';
		}

		// Reconstruct the pattern with the placeholders added before the extension
		return updatedBaseName + extension;
	}

	// If no extension is found, add {chunk} and {hash} at the end of the pattern
	return pattern + '-{chunk}-{hash}';
};
