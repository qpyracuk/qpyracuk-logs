export type TStyle = 'black' | 'bold' | 'italic' | 'faded' | 'underline' | 'flicker';
export type TColor = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'turquoise' | 'white';

const STYLES = new Map<TStyle, string>([
	['black', '0'],
	['bold', '1'],
	['faded', '2'],
	['italic', '3'],
	['underline', '4'],
	['flicker', '5'],
]);

const COLORS = new Map<TColor, string>([
	['black', '0'],
	['red', '1'],
	['green', '2'],
	['yellow', '3'],
	['blue', '4'],
	['purple', '5'],
	['turquoise', '6'],
	['white', '7'],
]);

export default function dye(params?: { s?: TStyle; f?: TColor; b?: TColor }) {
	if (process.env.DYE === 'off') return '';
	if (params !== undefined) {
		const { s, f, b } = params;
		if (s === undefined) {
			if (f === undefined) {
				if (b === undefined) {
					return '\x1b[0m';
				} else {
					return `\x1b[4${COLORS.get(b)}m`;
				}
			} else {
				if (b === undefined) {
					return `\x1b[3${COLORS.get(f)}m`;
				} else {
					return `\x1b[3${COLORS.get(f)};4${COLORS.get(b)}m`;
				}
			}
		} else {
			if (f === undefined) {
				if (b === undefined) {
					return `\x1b[${STYLES.get(s)}m`;
				} else {
					return `\x1b[${STYLES.get(s)};4${COLORS.get(b)}m`;
				}
			} else {
				if (b === undefined) {
					return `\x1b[${STYLES.get(s)};3${COLORS.get(f)}m`;
				} else {
					return `\x1b[${STYLES.get(s)};3${COLORS.get(f)};4${COLORS.get(b)}m`;
				}
			}
		}
	} else {
		return '\x1b[0m';
	}
}
