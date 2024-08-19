//#region Импорты типов
import type { ISerializator } from '../@types/configs/serializator';
import type { IPacket } from '../@types/general';
//#endregion

//#region Импорты
//#region Сериализаторы
import XML from '@qpyracuk/xml-builder';
import TEXT from '../serializators/text-serializator';
//#endregion

//#endregion

// ЭТОТ ФАЙЛ ТРЕБУЕТ ПЕРЕРАБОТКИ. ПОКА ЧТО ТУТ ИСПОЛЬЗУЮТСЯ КОСТЫЛИ!

type FirstParameter<T> = T extends (arg1: infer P, ...args: any[]) => any ? P : never;

export default class Serializator {
	static DEFAULT_STRINGIFY = (packet: IPacket) =>
		TEXT.createBuilder({
			date: true,
			time: true,
			level: true,
			minify: false,
		}).stringify(packet);

	public stringify: (packet: IPacket) => string = Serializator.DEFAULT_STRINGIFY.bind(this);

	constructor(config?: ISerializator) {
		if (config !== undefined) this.setSerializator(config);
	}

	setSerializator(config: ISerializator) {
		if (config === undefined || typeof config !== 'object')
			return void (this.stringify = Serializator.DEFAULT_STRINGIFY.bind(this));

		switch (config.type) {
			case 'xml':
				{
					const tmpOptions = config.options as FirstParameter<typeof XML.createBuilder>;
					const options = tmpOptions === undefined ? {} : tmpOptions;
					if (typeof options.preamble !== 'boolean') options.preamble = false;
					if (options.preamble && (typeof options.encoding !== 'string' || typeof options.encoding === 'string'))
						options.encoding = 'utf-8'.toUpperCase() as 'UTF-8';
					if (typeof options.pretty !== 'boolean') options.pretty = false;
					if (typeof options.typed !== 'boolean') options.typed = false;
					let depth = options.depth;
					if (depth === undefined) depth = 'Infinity';
					else {
						if (typeof depth === 'string' && depth !== 'Infinity') depth = 'Infinity';
						else if (typeof depth === 'number' && depth <= 0) depth = 'Infinity';
					}

					if (options.pretty && typeof options.tabWidth !== 'number' && options.tabWidth !== 'tab')
						options.tabWidth = 2;
					const builder = XML.createBuilder(options);
					this.stringify = (packet: IPacket) => builder.stringify(packet.record, depth);
				}
				break;
			case 'json':
				{
					const options = config.options === undefined ? {} : config.options;
					if (typeof options.delimiter !== 'string') options.delimiter = ',';
					if (typeof options.pretty !== 'boolean') options.pretty = false;

					this.stringify = (packet: IPacket) => JSON.stringify(packet) + options.delimiter;
				}
				break;
			case 'text':
				{
					const options = config.options === undefined ? {} : config.options;
					if (typeof options.date !== 'boolean') options.date = true;
					if (typeof options.level !== 'boolean') options.level = true;
					if (typeof options.minify !== 'boolean') options.minify = false;
					if (typeof options.time !== 'boolean') options.time = true;
					const builder = TEXT.createBuilder(options);
					this.stringify = (packet: IPacket) => builder.stringify(packet);
				}
				break;
			case 'custom':
				{
					if (config.handler !== undefined && typeof config.handler === 'function') {
						this.stringify = (packet: IPacket) => config.handler(packet);
					} else {
						this.stringify = Serializator.DEFAULT_STRINGIFY.bind(this);
					}
				}
				break;
		}
	}
}
