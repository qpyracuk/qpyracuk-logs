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

export default class Consumer {
	private readonly name: string;
	private readonly fileManager: FileManager;
	private readonly serializator: Serializator;

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

	public write(packet: IPacket) {
		packet.to = this.name;
		this.fileManager.write(Buffer.from(this.serializator.stringify(packet)));
	}

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

	private initializeOutDir(outDir?: string): string {
		if (!outDir) return DEFAULT_LOG_DIRECTORY;
		outDir = outDir.replace(/(\\|\/)/g, path.sep);
		if (outDir !== path.normalize(outDir)) return DEFAULT_LOG_DIRECTORY;
		return outDir;
	}
}
