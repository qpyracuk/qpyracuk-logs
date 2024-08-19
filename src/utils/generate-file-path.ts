//#region Imports
import { join } from 'path';
import { generateUniqueHash } from './generate-unique-hash';
//#endregion

/**
 * Generates a file path based on the provided pattern, output directory, and chunk number.
 * The pattern supports placeholders for various date components, chunk number, and a unique hash.
 *
 * @param {string} outDir - The directory where the file will be stored.
 * @param {string} pattern - The pattern string that defines the file name structure.
 * @param {number} chunkNumber - The chunk number to be included in the file name.
 * @returns {string} - The generated file path with the applied pattern.
 */
export const generateFilePath = (outDir: string, pattern: string, chunkNumber: number): string => {
	const date = new Date();

	const fileName = pattern
		.replace(/{YYYY}/g, date.getUTCFullYear().toString()) // Replace {YYYY} with the 4-digit year
		.replace(/{MM}/g, String(date.getUTCMonth() + 1).padStart(2, '0')) // Replace {MM} with the 2-digit month (01-12)
		.replace(/{DD}/g, String(date.getUTCDate()).padStart(2, '0')) // Replace {DD} with the 2-digit day (01-31)
		.replace(/{hh}/g, String(date.getUTCHours()).padStart(2, '0')) // Replace {hh} with the 2-digit hour (00-23)
		.replace(/{mm}/g, String(date.getUTCMinutes()).padStart(2, '0')) // Replace {mm} with the 2-digit minute (00-59)
		.replace(/{ss}/g, String(date.getUTCSeconds()).padStart(2, '0')) // Replace {ss} with the 2-digit second (00-59)
		.replace(/{chunk}/g, `(${chunkNumber})`) // Replace {chunk} with the chunk number in parentheses
		.replace(/{hash}/g, generateUniqueHash()); // Replace {hash} with a unique generated hash

	return join(outDir, fileName);
};
