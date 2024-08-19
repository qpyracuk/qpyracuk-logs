import type { IPacket } from '../general';
//#region OPTIONS

//#region XML options
/**
 * @description Serializer options to XML
 */
interface IBaseOptionsXML {
	/**
	 * @description Embed a preamble at the beginning
	 * @default false XML preamble missing
	 */
	preamble?: boolean;
	/**
	 * @description Encoding specified in the XML preamble
	 * @default undefined XML encoding missing
	 */
	encoding?: BufferEncoding;
	/**
	 * @description XML-builder will produce typed XML
	 * @default false Untyped XML
	 */
	typed?: boolean;
	/**
	 * @description Object traversal depth
	 * @default 'Infinity'
	 */
	depth?: number | 'Infinity';
}

/**
 * @description Serializer options to XML
 */
interface INonPrettyOptionsXML extends IBaseOptionsXML {
	/**
	 * @description Tab width in "pretty" mode
	 * @default false Compressed XML
	 */
	pretty?: false;
}

/**
 * @description Serializer options to XML
 */
interface IPrettyOptionsXML extends IBaseOptionsXML {
	/**
	 * @description XML-builder will produce human readable XML
	 * @default false Compressed XML
	 */
	pretty: true;
	/**
	 * @description Tab width in "pretty" mode
	 * @default 2 Tab width is 2 spaces
	 */
	tabWidth?: number | 'tab';
}

/**
 * @description Serializer options to XML
 */
export type IOptionsXML = IPrettyOptionsXML | INonPrettyOptionsXML;
//#endregion

//#region JSON options
/**
 * @description Serializer options to JSON
 */
export interface IOptionsJSON {
	/**
	 * @description Output JSON with tabs and line breaks
	 * @default false Compressed JSON
	 */
	pretty?: boolean;
	/**
	 * @description Separator character between values
	 * @default ',' By default, entries are separated by commas
	 */
	delimiter?: string;
}
//#endregion

//#region Text options
/**
 * @description Serializer options to text
 */
export interface IOptionsText {
	/**
	 * @description Add date to entry
	 * @default false Turned off
	 */
	date?: boolean;
	/**
	 * @description Add time to entry
	 * @default false Turned off
	 */
	time?: boolean;
	/**
	 * @description Add date to entry
	 * @default '' Empty line
	 */
	level?: boolean;
	/**
	 * @description Keep post titles as short as possible
	 * @default false Displaying unabridged titles
	 */
	minify?: boolean;
	/**
	 * @description Print logging packet route
	 * @default false The route is not displayed
	 */
	route?: boolean;
}
//#endregion
//#endregion

//#region Сериализаторы

/**
 * @description Serializer in XML
 */
export interface ISerializatorXML {
	type: 'xml';
	options?: IOptionsXML;
}

/**
 * @description Serializer in JSON
 */
export interface ISerializatorJSON {
	type: 'json';
	options?: IOptionsJSON;
}

/**
 * @description Serializer in text
 */
export interface ISerializatorText {
	type: 'text';
	options?: IOptionsText;
}

/**
 * @description Custom serializer
 */
interface ISerializatorCustom {
	type: 'custom';
	handler(packet: IPacket): string;
}

/**
 * @description Serializer Configuration
 */
export type ISerializator = ISerializatorXML | ISerializatorJSON | ISerializatorText | ISerializatorCustom;
//#endregion
