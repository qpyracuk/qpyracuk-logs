import { TLifeTime } from '../@types/general';

const oneMillisecond = 1;
const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 24;
const oneWeek = oneDay * 7;
const oneMonth = oneDay * 30; // Условно 30 дней
const oneYear = oneDay * 365; // Условно 365 дней

export function convertToMs(value: TLifeTime): number | never {
	const number = Number.parseInt(value.replace(/[^0-9]*/g, ''));
	if (number !== undefined && !isNaN(number)) {
		const modifier = value.replace(/[0-9]*/g, '');
		let k: number;
		switch (modifier) {
			case 'ms':
				k = oneMillisecond;
				break;
			case 's':
				k = oneSecond;
				break;
			case 'm':
				k = oneMinute;
				break;
			case 'h':
				k = oneHour;
				break;
			case 'D':
				k = oneDay;
				break;
			case 'W':
				k = oneWeek;
				break;
			case 'M':
				k = oneMonth;
				break;
			case 'Y':
				k = oneYear;
				break;
			default:
				throw new Error(
					'Syntax error when writing lifetime of log files. The value must match the RegExp /^[0-9]+(ms|s|m|h|D|W|M|Y)$/',
				);
		}
		if (number <= 0)
			return oneMonth; // Возвращаем значение по умолчанию, если число меньше или равно нулю
		else return k * number;
	} else {
		throw new Error(
			'Syntax error when writing lifetime of log files. The value must match the RegExp /^[0-9]+(ms|s|m|h|D|W|M|Y)$/',
		);
	}
}
