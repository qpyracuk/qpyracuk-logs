//#region Import types
import type { IRecord, TCreateLogLevel, ILogLevelFlags, TRunMode, TLogLevel } from '../@types/general';
import type { IProducerOptions } from '../@types/instances/producer';
import type { IConsole, ICreateConsole } from '../@types/configs/console';
//#endregion

//#region Imports
import { EventEmitter } from 'events';
import { getFullTime } from '../utils/get-time';
import dye, { TColor } from '../utils/dye';
//#endregion

export const levelToColor = (level: TLogLevel): TColor => {
	switch (level) {
		case 'log':
			return 'white';
		case 'error':
			return 'red';
		case 'info':
			return 'turquoise';
		case 'confirm':
			return 'green';
		case 'debug':
			return 'purple';
		case 'warn':
			return 'yellow';
		default:
			return 'white';
	}
};

const EMOJI: Readonly<{
	LOG: string;
	ERROR: string;
	INFO: string;
	DEBUG: string;
	WARN: string;
	CONFIRM: string;
}> = {
	LOG: '\u{1F4C4}',
	ERROR: '\u{26D4}',
	INFO: '\u{1F50D}',
	DEBUG: '\u{1F527}',
	WARN: '\u{26A1}',
	CONFIRM: '\u{2705}',
};

function createDefaultConsoleConfig(): IConsole {
	return {
		on: true,
		runMode: 'development',
		pretty: {
			on: true,
			title: '',
			time: true,
			emoji: false,
		},
	};
}

function createLogLevelFlags(value: boolean): ILogLevelFlags {
	return {
		log: value,
		error: value,
		info: value,
		confirm: value,
		debug: value,
		warn: value,
	};
}

const LOG_LEVEL: Set<TCreateLogLevel> = new Set(['*', 'log', 'error', 'info', 'warn', 'debug', 'confirm']);

export default class Producer extends EventEmitter {
	private readonly isOn: boolean;
	private readonly runMode: TRunMode;
	private readonly console: IConsole;
	private readonly levelFlags: ILogLevelFlags;
	private readonly name: string;

	constructor(config: IProducerOptions = {}) {
		super();
		this.name = config.name || `Producer`;
		this.runMode = config.runMode || '*';

		this.console = this.initializeConsole(config.console);
		this.levelFlags = this.initializeLevelFlags(config.level);
		this.isOn = this.runMode === '*' || process.env.NODE_ENV === this.runMode;
	}

	public log(message?: unknown, ...optionalParams: unknown[]): void {
		this.logMessage('log', message, optionalParams);
	}

	public error(message?: unknown, ...optionalParams: unknown[]): void {
		this.logMessage('error', message, optionalParams);
	}

	public info(message?: unknown, ...optionalParams: unknown[]): void {
		this.logMessage('info', message, optionalParams);
	}

	public confirm(message?: unknown, ...optionalParams: unknown[]): void {
		this.logMessage('confirm', message, optionalParams);
	}

	public debug(message?: unknown, ...optionalParams: unknown[]): void {
		this.logMessage('debug', message, optionalParams);
	}

	public warn(message?: unknown, ...optionalParams: unknown[]): void {
		this.logMessage('warn', message, optionalParams);
	}

	protected getLogLevels() {
		return this.levelFlags;
	}

	private logMessage(level: TLogLevel, message?: unknown, ...optionalParams: unknown[]): void {
		if (!this.isOn || !this.levelFlags[level]) return;
		if (this.console.on) {
			const formattedMessage = this.formatMessage(level, message, optionalParams);
			switch (level) {
				case 'log':
					console.log(formattedMessage);
					break;
				case 'error':
					console.error(formattedMessage);
					break;
				case 'info':
					console.info(formattedMessage);
					break;
				case 'confirm':
					console.info(formattedMessage);
					break;
				case 'debug':
					console.debug(formattedMessage);
					break;
				case 'warn':
					console.warn(formattedMessage);
					break;
				default:
					console.log(formattedMessage);
					break;
			}
		}

		this.send(level, message, optionalParams);
	}

	private formatMessage(level: TLogLevel, message: unknown, optionalParams: unknown[]): string {
		const { pretty } = this.console;
		const emoji = pretty.emoji ? EMOJI[level.toUpperCase() as Uppercase<typeof level>] : level.toUpperCase();
		const time = pretty.time ? `${getFullTime(new Date())} ` : '';
		const title = pretty.title || '';

		return `${dye({ s: 'bold', f: levelToColor(level) })}${emoji}: ${time}${title}\n${String(message)} ${String(optionalParams.join(' '))}${dye()}`;
	}

	private initializeConsole(console?: ICreateConsole): IConsole {
		const consoleConfig = createDefaultConsoleConfig();
		if (!console) return consoleConfig;
		consoleConfig.runMode = console.runMode ?? consoleConfig.runMode;
		consoleConfig.on = console.on ?? consoleConfig.on;
		consoleConfig.pretty.on = console.pretty?.on ?? consoleConfig.pretty.on;
		consoleConfig.pretty.time = console.pretty?.time ?? consoleConfig.pretty.time;
		consoleConfig.pretty.title = console.pretty?.title ?? consoleConfig.pretty.title;
		consoleConfig.pretty.emoji = console.pretty?.emoji ?? consoleConfig.pretty.emoji;
		return consoleConfig;
	}

	private initializeLevelFlags(levels?: TCreateLogLevel | TCreateLogLevel[]): ILogLevelFlags {
		if (!levels || levels === '*') return createLogLevelFlags(true);
		const exactlyArray = Array.isArray(levels) ? levels : [levels];
		if (exactlyArray.includes('*')) return createLogLevelFlags(false);
		const levelFlags = createLogLevelFlags(false);
		for (const level of exactlyArray as TLogLevel[]) levelFlags[level] = LOG_LEVEL.has(level);
		return levelFlags;
	}

	private send(level: TLogLevel, message?: unknown, optionalParams?: unknown[]): void {
		const payload = [];
		if (message) payload.push(message);
		if (optionalParams && optionalParams.length > 0) payload.push(...optionalParams);
		const record: IRecord = { info: { level, time: new Date() }, payload };
		this.emit(level, { from: this.name, to: '?', record });
	}
}
