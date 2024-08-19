//#region Импорты типов
import type { IConsumerOptions } from '../@types/instances/consumer';
import type { IPacket, TLogLevel } from '../@types/general';
//#endregion

//#region Импорты
import path from 'node:path';
import Producer from './Producer';
import FileManager from './FileManager';
import Serializator from './Serializator';
import { convertToMs } from '../utils/lifetime-handlers';
//#endregion

const DEFAULT_LOG_DIRECTORY = path.resolve(__dirname, '..', 'logs');

/**
 * Consumer class for handling logs produced by one or more Producers. It manages the
 * serialization, writing, and file management of log data, including features like
 * rotation, archiving, and cleaning of log files.
 */
export default class Consumer {
	private readonly name: string;
	private readonly fileManager: FileManager;
	private readonly serializator: Serializator;

	/**
	 * Initializes a new instance of the Consumer class.
	 *
	 * @param {IConsumerOptions} [config={}] - The configuration options for the Consumer.
	 * @param {string} [config.name] - The name of the Consumer instance.
	 * @param {string} [config.outDir] - The directory where logs should be stored.
	 * @param {string} [config.pattern] - The filename pattern for log files.
	 * @param {object} [config.cleaning] - Configuration for cleaning log files.
	 * @param {string} [config.cleaning.timeUntilCleaning] - Time before a log file is eligible for cleaning.
	 * @param {boolean} [config.cleaning.on] - Whether cleaning is enabled.
	 * @param {string} [config.cleaning.schedule] - The cron schedule for cleaning log files.
	 * @param {object} [config.rotate] - Configuration for rotating log files.
	 * @param {boolean} [config.rotate.on] - Whether rotation is enabled.
	 * @param {string} [config.rotate.schedule] - The cron schedule for rotating log files.
	 * @param {object} [config.archiving] - Configuration for archiving log files.
	 * @param {boolean} [config.archiving.on] - Whether archiving is enabled.
	 * @param {string} [config.archiving.schedule] - The cron schedule for archiving log files.
	 * @param {string} [config.archiving.timeUntilArchiving] - Time before a log file is eligible for archiving.
	 * @param {number} [config.maxFileSize=Infinity] - The maximum size of a log file before rotation.
	 * @param {boolean} [config.debug=false] - Enables or disables debug mode.
	 * @param {Serializator} [config.serializator] - The serializator instance for formatting log data.
	 * @param {Producer|Producer[]} [config.listen] - One or more producers to listen to for log data.
	 */
	constructor(config: IConsumerOptions = {}) {
		this.name = config.name || `Consumer`;
		const outDir = this.initializeOutDir(config.outDir);
		const pattern = config.pattern || 'log-{YYYY}-{MM}-{DD}_{hh}-{mm}-{ss}.log';
		const timeUntilCleaning = convertToMs(config.cleaning?.timeUntilCleaning ?? '14D');
		const isRotating = config.rotate?.on ?? true;
		const isCleaning = config.cleaning?.on ?? true;
		const isArchiving = config.archiving?.on ?? true;
		const rotateSchedule = config.rotate?.schedule ?? '0 0 * * *';
		const cleaningSchedule = config.cleaning?.schedule ?? '0 0 * * *';
		const archivingSchedule = config.archiving?.schedule ?? '0 0 * * *';
		const timeUntilArchiving = config.archiving?.timeUntilArchiving
			? convertToMs(config.archiving?.timeUntilArchiving)
			: convertToMs(config.archiving?.timeUntilArchiving ?? '14D') / 2;
		const maxFileSize = config.maxFileSize ?? Infinity;
		const debug = config.debug ?? false;
		this.serializator = new Serializator(config.serializator);
		this.fileManager = new FileManager(
			outDir,
			pattern,
			maxFileSize,
			timeUntilCleaning,
			timeUntilArchiving,
			isRotating,
			rotateSchedule,
			isCleaning,
			cleaningSchedule,
			isArchiving,
			archivingSchedule,
			debug,
		);

		if (config.listen) this.listen(config.listen);
	}

	/**
	 * Begins listening to one or more Producers for log events.
	 *
	 * @param {Producer|Producer[]} producers - One or more Producer instances to listen to.
	 */
	public listen(producers: Producer | Producer[]): void {
		const producerInstances = Array.isArray(producers) ? producers : [producers];
		for (const producer of producerInstances) {
			const logLevels = (
				producer as unknown as Record<'getLogLevels', () => Record<TLogLevel, boolean>>
			).getLogLevels();
			for (const level in logLevels) {
				if (logLevels[level as TLogLevel]) producer.on(level, this.write.bind(this));
			}
		}
	}

	/**
	 * Stops listening to one or more Producers for log events.
	 *
	 * @param {Producer|Producer[]} producers - One or more Producer instances to stop listening to.
	 */
	public unlisten(producers: Producer | Producer[]): void {
		const producerInstances = Array.isArray(producers) ? producers : [producers];
		for (const producer of producerInstances) {
			const logLevels = (
				producer as unknown as Record<'getLogLevels', () => Record<TLogLevel, boolean>>
			).getLogLevels();
			for (const level in logLevels) {
				if (logLevels[level as TLogLevel]) producer.off(level, this.write.bind(this));
			}
		}
	}

	/**
	 * Writes a log packet to the log file. The packet is serialized and then written
	 * using the FileManager instance.
	 *
	 * @private
	 * @param {IPacket} packet - The log packet to be written to the log file.
	 */
	private write(packet: IPacket) {
		packet.to = this.name;
		this.fileManager.write(Buffer.from(this.serializator.stringify(packet)));
	}

	/**
	 * Initializes the output directory for log files. If the provided directory is
	 * invalid or not specified, the default log directory is used.
	 *
	 * @private
	 * @param {string} [outDir] - The specified output directory.
	 * @returns {string} - The validated output directory path.
	 */
	private initializeOutDir(outDir?: string): string {
		if (!outDir) return DEFAULT_LOG_DIRECTORY;
		outDir = outDir.replace(/(\\|\/)/g, path.sep);
		if (outDir !== path.normalize(outDir)) return DEFAULT_LOG_DIRECTORY;
		return outDir;
	}
}
