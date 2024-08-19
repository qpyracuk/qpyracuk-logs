//#region Импорты типов
import type { IPacket, TLogLevel } from '../@types/general';
import type { IOptionsText } from '../@types/configs/serializator';
//#endregion

//#region Импорты
import { getFullTime, getOnlyDate, getOnlyTime } from '../utils/get-time';
//#endregion

const minifyLevel: Map<TLogLevel, string> = new Map([
	['log', '[L]: '],
	['error', '[E]: '],
	['info', '[I]: '],
	['confirm', '[C]: '],
	['debug', '[D]: '],
	['warn', '[W]: '],
]);

const normalizeLevel: Map<TLogLevel, string> = new Map([
	['log', '[LOG]:    \t'],
	['error', '[ERROR]:  \t'],
	['info', '[INFO]:   \t'],
	['confirm', '[CONFIRM]:\t'],
	['debug', '[DEBUG]:  \t'],
	['warn', '[WARNING]:\t'],
]);

const fullLevel: Map<TLogLevel, string> = new Map([
	['log', '[LOG]: '],
	['error', '[ERROR]: '],
	['info', '[INFO]: '],
	['confirm', '[CONFIRM]: '],
	['debug', '[DEBUG]: '],
	['warn', '[WARNING]: '],
]);

export default class TEXT {
	private $_getTime: (date: Date) => string = () => '';
	private $_getLevel: (level: TLogLevel) => string = () => '';
	private $_getRoute: (from: string, to: string) => string = () => '';

	static createBuilder(options?: IOptionsText) {
		if (options === undefined)
			return new TEXT({
				date: true,
				time: true,
				level: true,
				minify: false,
			});
		else return new TEXT(options);
	}

	constructor(options: IOptionsText) {
		if (options.date === true && options.time === true) this.$_getTime = getFullTime.bind(getFullTime);
		else if (options.date === true) this.$_getTime = getOnlyDate.bind(getOnlyDate);
		else if (options.time === true) this.$_getTime = getOnlyTime.bind(getOnlyTime);
		if (options.level === true) {
			if (options.minify === true) this.$_getLevel = (level: TLogLevel) => minifyLevel.get(level) || '';
			else if (options.route === true) this.$_getLevel = (level: TLogLevel) => fullLevel.get(level) || '';
			else this.$_getLevel = (level: TLogLevel) => normalizeLevel.get(level) || '';
		}

		if (options.route === true) {
			if (options.minify === true) this.$_getRoute = (from: string, to: string) => `[${from}=>${to}]`;
			else this.$_getRoute = (from: string, to: string) => `[${from} => ${to}]`;
		}
	}

	stringify(packet: IPacket) {
		let result = `${this.$_getRoute(packet.from, packet.to)}${this.$_getTime(packet.record.info.time)}${this.$_getLevel(packet.record.info.level)}`;

		const payload = packet.record.payload;
		const payloadLength = payload.length;

		for (let i = 0; i < payloadLength; i++) {
			const item = payload[i];
			if (item == null) continue;

			let itemString = '';

			if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
				itemString = String(item);
			} else if (Array.isArray(item)) {
				itemString = item.length > 0 ? `[${item.join(', ')}]` : '[]';
			} else if (item instanceof Map) {
				let mapParts = [];
				for (const [key, value] of item) {
					mapParts.push(`${key} => ${value}`);
				}
				itemString = `Map(${mapParts.join(', ')})`;
			} else if (item instanceof Set) {
				itemString = `Set(${Array.from(item).join(', ')})`;
			} else if (typeof item === 'object') {
				itemString = 'Object';
			}

			if (itemString) {
				result += ` | ${itemString}`;
			}
		}

		return result + '\n';
	}
}
