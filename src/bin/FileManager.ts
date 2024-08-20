import { exists, mkdir, readdir, ReadStream, stat, unlink, WriteStream } from 'fylo';
import { join } from 'path';
import { convertPatternToRegExp } from '../utils/convert-pattern-to-regexp';
import { generateFilePath } from '../utils/generate-file-path';
import { ensureChunkAndHashInPattern } from '../utils/ensure-chunk-and-hash-in-pattern';
import { schedule } from 'node-cron';
import * as zlib from 'zlib';

import * as fs from 'fs';
import dye from '../utils/dye';

const LOG_STRING_START = `${dye({ f: 'purple', s: 'bold' })}[LOGGER]${dye()}${dye({ f: 'turquoise' })}`;
const LOG_STRING_FINISH = dye();

export default class FileManager {
	private outDir: string;
	private pattern: string;
	private maxFileSize: number;

	private lifetime: number;
	private archiveLifetime: number;

	private rotateSchedule: string;
	private cleaningSchedule: string;
	private archiveSchedule: string;

	private enableRotation: boolean;
	private enableCleaning: boolean;
	private enableArchiving: boolean;

	private debug: boolean;

	private currentFileSize: number = 0;
	private validator: RegExp;
	private currentWriteStream: WriteStream | null = null;
	private buffer: Buffer = Buffer.alloc(0);
	private bufferSize: number = 0;
	private readonly MAX_BUFFER_SIZE = 2 * 1024 * 1024;
	private lastResetDate: string = '';
	private isInitialized: boolean = false;

	constructor(
		outDir: string,
		pattern: string,
		maxFileSize: number,
		lifetime: number,
		archiveVia: number,
		isRotating: boolean = true,
		rotateSchedule: string = '0 0 * * *',
		isCleaning: boolean = true,
		cleaningSchedule: string = '0 0 * * *',
		isArchiving: boolean = true,
		archivingSchedule: string = '0 0 * * *',
		debug: boolean = false,
	) {
		this.outDir = outDir;
		this.pattern = ensureChunkAndHashInPattern(pattern || 'log-{YYYY}-{MM}-{DD}_{hh}-{mm}-{ss}.log');
		this.maxFileSize = maxFileSize;
		this.lifetime = lifetime;
		this.archiveLifetime = archiveVia;
		this.debug = debug;

		this.enableRotation = isRotating;
		this.rotateSchedule = rotateSchedule;
		this.enableCleaning = isCleaning;
		this.cleaningSchedule = cleaningSchedule;
		this.enableArchiving = isArchiving;
		this.archiveSchedule = archivingSchedule;

		this.validator = convertPatternToRegExp(this.pattern);

		this.log('FileManager initialized with the following settings:');
		this.log(`Output Directory: ${this.outDir}`);
		this.log(`Pattern: ${this.pattern}`);
		this.log(`Max File Size: ${this.maxFileSize}`);
		this.log(`File Lifetime: ${this.lifetime}`);
		this.log(`Archive Via: ${this.archiveLifetime}`);
		this.log(`Rotation Enabled: ${this.enableRotation}`);
		this.log(`Rotation Schedule: ${this.rotateSchedule}`);
		this.log(`Cleaning Enabled: ${this.enableCleaning}`);
		this.log(`Cleaning Schedule: ${this.cleaningSchedule}`);
		this.log(`Archiving Enabled: ${this.enableArchiving}`);
		this.log(`Archiving Schedule: ${this.archiveSchedule}`);
		this.log(`Debug Mode: ${this.debug}`);

		this.validateInputs();

		this.initializeWriteStream().then(() => this.scheduleJobs());
	}

	private log(message: string) {
		if (this.debug) {
			console.log(`${LOG_STRING_START} ${message}${LOG_STRING_FINISH}`);
		}
	}

	private validateInputs() {
		const requiredParams = {
			outDir: this.outDir,
			pattern: this.pattern,
			maxFileSize: this.maxFileSize,
			lifetime: this.lifetime,
			archiveLifetime: this.archiveLifetime,
			rotateSchedule: this.rotateSchedule,
			cleaningSchedule: this.cleaningSchedule,
			archiveSchedule: this.archiveSchedule,
		};

		for (const [key, value] of Object.entries(requiredParams)) {
			if (value === undefined || value === null || (typeof value === 'number' && value <= 0)) {
				throw new Error(`Invalid input: ${key} is required and must be a valid value.`);
			}
		}

		// Ensure lifetime is greater than archiveLifetime
		if (this.lifetime <= this.archiveLifetime) {
			throw new Error('File lifetime must be greater than archive lifetime.');
		}

		this.log('Inputs validated successfully.');
	}

	// Utility Functions

	// Метод, который возвращает все файлы, соответствующие паттерну и паттерну с расширением .gz
	private async getAllFilePathsByPattern(dirPath: string, pattern: RegExp): Promise<string[]> {
		try {
			const files = await readdir(dirPath);
			this.log(`Found ${files.length} files in directory.`);

			const matchedFiles = files.filter((file) => pattern.test(file) || pattern.test(file.replace(/\.gz$/, '')));
			this.log(`Matched ${matchedFiles.length} files with the pattern including gzipped files.`);
			return matchedFiles.map((file) => join(dirPath, file));
		} catch (error) {
			this.log(`Error reading directory ${dirPath}: ${(error as Error).message}`);
			return [];
		}
	}

	// Метод, который возвращает только несжатые файлы, соответствующие паттерну
	private async getUncompressedFilePathsByPattern(dirPath: string, pattern: RegExp): Promise<string[]> {
		try {
			const files = await readdir(dirPath);
			this.log(`Found ${files.length} files in directory.`);

			const matchedFiles = files.filter((file) => pattern.test(file) && !file.endsWith('.gz'));
			this.log(`Matched ${matchedFiles.length} uncompressed files with the pattern.`);
			return matchedFiles.map((file) => join(dirPath, file));
		} catch (error) {
			this.log(`Error reading directory ${dirPath}: ${(error as Error).message}`);
			return [];
		}
	}

	private async getFileStats(filePaths: string[]): Promise<Map<string, fs.Stats>> {
		const fileStatsMap = new Map<string, fs.Stats>();

		try {
			await Promise.all(
				filePaths.map(async (filePath) => {
					try {
						const stats = await stat(filePath);
						fileStatsMap.set(filePath, stats);
						this.log(`Retrieved stats for file: ${filePath}`);
					} catch (error) {
						this.log(`Error getting stats for file ${filePath}: ${(error as Error).message}`);
					}
				}),
			);
		} catch (error) {
			this.log(`Unexpected error during stats retrieval: ${(error as Error).message}`);
		}

		return fileStatsMap;
	}

	private filterExpiredFiles(filePaths: string[], fileStatsMap: Map<string, fs.Stats>): string[] {
		const currentTime = Date.now();
		const filteredFiles = filePaths.filter((filePath) => {
			const fileStats = fileStatsMap.get(filePath);
			return fileStats ? currentTime - fileStats.mtimeMs < this.lifetime : false;
		});

		this.log(`Filtered ${filteredFiles.length} files that are within the lifetime.`);
		return filteredFiles;
	}

	private async getFilesToArchive(filePaths: string[], fileStatsMap: Map<string, fs.Stats>): Promise<string[]> {
		const currentTime = Date.now();
		const filesToArchive = filePaths.filter((filePath) => {
			const fileStats = fileStatsMap.get(filePath);
			return fileStats ? currentTime - fileStats.mtimeMs > this.archiveLifetime : false;
		});

		this.log(`Found ${filesToArchive.length} files to archive.`);
		return filesToArchive;
	}

	private async deleteExpiredFiles(filePaths: string[], fileStatsMap: Map<string, fs.Stats>) {
		const expiredFiles = filePaths.filter((filePath) => {
			const fileStats = fileStatsMap.get(filePath);
			return fileStats ? Date.now() - fileStats.mtimeMs > this.lifetime : false;
		});

		try {
			await Promise.all(
				expiredFiles.map(async (filePath) => {
					try {
						await unlink(filePath);
						this.log(`Deleted expired file: ${filePath}`);
					} catch (error) {
						this.log(`Error deleting file ${filePath}: ${(error as Error).message}`);
					}
				}),
			);
		} catch (error) {
			this.log(`Unexpected error during file deletion: ${(error as Error).message}`);
		}
	}

	private extractChunkNumber(filePath: string): number {
		const match = filePath.match(/\((\d+)\)/);
		const chunkNumber = match ? parseInt(match[1], 10) : 1;

		this.log(`Extracted chunk number ${chunkNumber} from file path: ${filePath}`);
		return chunkNumber;
	}

	private findLatestLiveFile(filePaths: string[], fileStatsMap: Map<string, fs.Stats>): string | null {
		const today = new Date().toISOString().split('T')[0];
		let latestFile: string | null = null;
		let latestMTime = 0;

		for (const filePath of filePaths) {
			const fileStats = fileStatsMap.get(filePath);

			if (fileStats) {
				const fileDate = new Date(fileStats.mtimeMs).toISOString().split('T')[0];

				if (fileDate === today && fileStats.mtimeMs > latestMTime) {
					latestMTime = fileStats.mtimeMs;
					latestFile = filePath;
				}
			}
		}

		this.log(latestFile ? `Found latest live file from today: ${latestFile}` : 'No live file found for today.');
		return latestFile;
	}

	private async checkCurrentFileExists() {
		if (this.currentWriteStream) {
			try {
				const filePath = this.currentWriteStream.getNativeStream().path.toString();
				const fileExists = await exists(filePath);

				if (!fileExists) {
					this.log(`Current file ${filePath} does not exist. Recreating new file.`);
					if (this.enableRotation) {
						await this.rotate();
					}
				} else {
					this.log(`Current file ${filePath} exists.`);
				}
			} catch (error) {
				this.log(`Failed to check if current file exists: ${(error as Error).message}`);
			}
		}
	}

	private resetChunkCounter() {
		const currentDate = new Date().toISOString().split('T')[0];
		if (this.lastResetDate !== currentDate) {
			this.lastResetDate = currentDate;
			this.log('Chunk counter has been reset');
		}
	}

	private bufferData(data: Buffer) {
		const dataSize = data.length;

		if (this.bufferSize + dataSize > this.MAX_BUFFER_SIZE) {
			this.trimBuffer(dataSize);
		}

		this.buffer = Buffer.concat([this.buffer, data]);
		this.bufferSize += dataSize;

		this.log(`Buffered data of size ${dataSize} bytes. Buffer size is now ${this.bufferSize} bytes.`);
	}

	private trimBuffer(dataSize: number) {
		const spaceNeeded = this.bufferSize + dataSize - this.MAX_BUFFER_SIZE;

		this.buffer = this.buffer.subarray(spaceNeeded);
		this.bufferSize = this.MAX_BUFFER_SIZE - dataSize;

		this.log(`Trimmed buffer by ${spaceNeeded} bytes. New buffer size is ${this.bufferSize} bytes.`);
	}

	private async flushBuffer() {
		if (this.bufferSize > 0 && this.currentWriteStream && this.currentWriteStream.isStreamOpen()) {
			try {
				await this.currentWriteStream.write(this.buffer);
				this.updateCurrentFileSize(this.bufferSize);

				this.log(`Flushed ${this.bufferSize} bytes from buffer to file.`);

				this.buffer = Buffer.alloc(0);
				this.bufferSize = 0;
			} catch (error) {
				this.log(`Failed to flush buffer: ${(error as Error).message}`);
			}
		}
	}

	private updateCurrentFileSize(bytes: number) {
		if (this.maxFileSize !== Infinity) {
			this.currentFileSize += bytes;
			this.log(`Updated current file size by ${bytes} bytes. Total size is now ${this.currentFileSize} bytes.`);
		}
	}

	// Directory Management

	private async initializeWriteStream() {
		try {
			const isDirectoryExists = await exists(this.outDir);
			if (!isDirectoryExists) {
				try {
					await mkdir(this.outDir);
					this.log(`Created output directory: ${this.outDir}`);
				} catch {
					this.log(`Failed to create directory: ${this.outDir}`);
				}
			}

			await this.cleanupOldFiles();
			const filePaths = await this.getUncompressedFilePathsByPattern(this.outDir, this.validator);
			const fileStatsMap = await this.getFileStats(filePaths);
			const liveFiles = this.filterExpiredFiles(filePaths, fileStatsMap);

			if (liveFiles.length > 0) {
				const latestFile = this.findLatestLiveFile(liveFiles, fileStatsMap);
				if (latestFile) {
					this.currentWriteStream = new WriteStream(latestFile);
					await this.currentWriteStream.open({ encoding: 'utf-8', flags: 'a' });
					this.log(`Continuing to write to existing file: ${latestFile}`);

					const stats = await stat(latestFile);
					this.currentFileSize = stats.size;
					this.log(`Initialized current file size to ${this.currentFileSize} bytes.`);

					await this.flushBuffer();
					this.isInitialized = true;
					return;
				}
			} else await this.createNewWriteStream(1);
			this.isInitialized = true;
		} catch (error) {
			this.log(`Error during write stream initialization: ${(error as Error).message}`);
			this.isInitialized = true;
		}
	}

	private async createNewWriteStream(chunkNumber: number) {
		try {
			const newFileName = generateFilePath(this.outDir, this.pattern, chunkNumber);
			this.currentWriteStream = new WriteStream(newFileName);

			await this.currentWriteStream.open({ encoding: 'utf-8', flags: 'a' });
			this.currentFileSize = 0;
			this.log(`Created and writing to new file: ${newFileName}`);

			await this.flushBuffer();
		} catch (error) {
			this.log(`Failed to create new file: ${(error as Error).message}`);
			this.currentWriteStream = null;
		}
	}

	async write(data: Buffer) {
		if (!this.isInitialized) {
			this.bufferData(data);
			return;
		}
		try {
			if (!this.currentWriteStream || !this.currentWriteStream.isStreamOpen()) {
				this.log('Stream is not open, buffering data.');
				this.bufferData(data);
				await this.ensureWriteStreamOpen();
				return;
			}

			await this.currentWriteStream.write(data);
			this.updateCurrentFileSize(data.length);
			this.log(`Wrote data of size ${data.length} bytes to file.`);

			if (this.maxFileSize !== Infinity && this.currentFileSize > this.maxFileSize) {
				this.log('File size limit reached after write.');
				if (this.enableRotation) {
					await this.rotate();
				}
			}
		} catch (error) {
			this.log(`Error writing data, buffering data: ${(error as Error).message}`);
			this.bufferData(data);
			await this.ensureWriteStreamOpen();
		}
	}

	private async ensureWriteStreamOpen() {
		const isDirectoryExists = await exists(this.outDir);
		if (!isDirectoryExists) {
			await mkdir(this.outDir);
			this.log(`Created output directory: ${this.outDir}`);
		}
		if (!this.currentWriteStream || !this.currentWriteStream.isStreamOpen()) {
			this.log('Stream is not open, attempting to reopen.');
			if (this.enableRotation) {
				await this.rotate();
			}
		}
	}

	private async rotate() {
		if (!this.enableRotation) {
			this.log('Rotation is disabled. Skipping rotation.');
			return;
		}

		try {
			let latestChunk = 0;

			if (this.currentWriteStream) {
				latestChunk = this.extractChunkNumber(this.currentWriteStream.getNativeStream().path.toString());

				await this.flushBuffer();
				await this.currentWriteStream.close();
				this.log('Closed current write stream');
			}

			await this.createNewWriteStream(latestChunk + 1);
			this.log('Rotated to new write stream');
		} catch (error) {
			this.log(`Failed during rotation, buffering further writes: ${(error as Error).message}`);
		} finally {
			await this.flushBuffer();
		}
	}

	async cleanupOldFiles() {
		try {
			const filePaths = await this.getAllFilePathsByPattern(this.outDir, this.validator);
			const fileStatsMap = await this.getFileStats(filePaths);
			await this.deleteExpiredFiles(filePaths, fileStatsMap);
			this.log('Cleaned up old files.');
		} catch (error) {
			this.log(`Failed to clean up old files: ${(error as Error).message}`);
		}
	}

	// Scheduling

	private scheduleJobs() {
		// Проверка существования текущего файла каждые 15 минут
		if (this.enableRotation || this.enableCleaning) {
			schedule('*/15 * * * *', async () => {
				await this.checkCurrentFileExists();
				this.log('Checked if current file exists.');
			});
		}

		// Запланированная ротация файлов
		if (this.enableRotation) {
			schedule(this.rotateSchedule, async () => {
				await this.rotate();
				this.log('Scheduled file rotation.');
			});
		}

		// Запланированная очистка старых файлов
		if (this.enableCleaning) {
			schedule(this.cleaningSchedule, async () => {
				await this.cleanupOldFiles();
				this.log('Scheduled cleanup of old files.');
			});
		}

		// Запланированная архивация файлов
		if (this.enableArchiving) {
			schedule(this.archiveSchedule, async () => {
				await this.archiveOldFiles();
				this.log('Scheduled file archiving.');
			});
		}

		// Сброс счётчика чанк-файлов ежедневно
		schedule('0 0 * * *', async () => {
			this.resetChunkCounter();
			this.log('Scheduled daily chunk counter reset.');
		});
	}

	private async archiveOldFiles() {
		try {
			const filePaths = await this.getUncompressedFilePathsByPattern(this.outDir, this.validator);
			const fileStatsMap = await this.getFileStats(filePaths);
			const filesToArchive = await this.getFilesToArchive(filePaths, fileStatsMap);

			for (const filePath of filesToArchive) {
				try {
					const gzFilePath = `${filePath}.gz`;
					await this.compressFile(filePath, gzFilePath);
					this.log(`Archived original file: ${filePath}`);
				} catch (error) {
					this.log(`Failed to archive file ${filePath}: ${(error as Error).message}`);
				}
				try {
					await unlink(filePath);
					this.log(`Deleted original file: ${filePath}`);
				} catch (error) {
					this.log(`Failed to delete original file ${filePath}: ${(error as Error).message}`);
				}
			}
		} catch (error) {
			this.log(`Failed to archive files: ${(error as Error).message}`);
		}
	}

	private async compressFile(inputFile: string, outputFile: string): Promise<void> {
		const inputStream = new ReadStream(inputFile);
		const outputStream = new WriteStream(outputFile);
		const gzipStream = zlib.createGzip();

		const isFileExists = await exists(inputFile);
		if (!isFileExists) throw new Error('Файл отсутствует');

		await inputStream
			.open()
			.then(() => outputStream.open())
			.then(() => inputStream.pipe(gzipStream) as zlib.Gzip)
			.then((stream) => stream.pipe(outputStream.getNativeStream()));
	}
}
