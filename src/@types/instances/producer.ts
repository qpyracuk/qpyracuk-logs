//#region Импорт типов
import type { TCreateLogLevel, TRunMode } from '../general';
import type { ICreateConsole } from '../configs/console';
//#endregion

/**
 * @description Producer configuration
 */
export interface IProducerOptions {
	/**
	 * @description Console Output Configuration
	 * @type {ICreateConsole}
	 * @default console: {on: true, runMode: 'development', pretty: {on: true, title: '', time: true, emoji: true} }
	 */
	console?: ICreateConsole;
	/**
	 * @description Log level
	 * @type {TCreateLogLevel | TCreateLogLevel[]}
	 * @default '*' The producer works for all logging levels
	 */
	level?: TCreateLogLevel | TCreateLogLevel[];
	/**
	 * @description Selecting the NODE_ENV mode in which the producer will work
	 * @default '*' The producer will work in any mode
	 */
	runMode?: TRunMode;
	/**
	 * @description Producer's name. An optional property that can be set to track the route of a logging package
	 * @type {string}
	 * @default `P #${index}`
	 */
	name?: string;
}
