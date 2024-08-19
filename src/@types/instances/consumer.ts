import type { ISerializator } from '../configs/serializator';
import type { TLifeTime } from '../general';
import Producer from '../../bin/Producer';

/**
 * @description Consumer configuration
 */
export interface IConsumerOptions {
	/**
	 * @description Directory where log files will be written
	 * @type {string}
	 * @default path.resolve(__dirname, '..', 'logs')
	 */
	outDir?: string;

	/**
	 * @description One or more listened producers
	 * @type {Producer | Producer[]}
	 * @default []
	 */
	listen?: Producer | Producer[];

	/**
	 * @description Consumer's name. An optional property that can be set to track the route of a logging package
	 * @type {string}
	 * @default `C #${index}`
	 */
	name?: string;

	/**
	 * @description The template by which log files will be named
	 * @type {string}
	 * @example "title-{YYYY}-{MM}-{DD}.log"
	 *
	 * Substitute templates:
	 * @template {YYYY} - Year to create log file
	 * @template {MM} - Month to create log file
	 * @template {DD} - Day to create log file
	 * @template {hh} - Hour to create log file
	 * @template {mm} - Minute to create log file
	 * @template {ss} - Second to create log file
	 * @default 'log-{YYYY}-{MM}-{DD}_{hh}-{mm}-{ss}.log'
	 */
	pattern?: string;

	/**
	 * @description Setting up the data serializer
	 * @type {ISerializator}
	 * @default ISerializatorText
	 */
	serializator?: ISerializator;

	rotate?: {
		/**
		 * @description Enables log rotation
		 * @type {boolean}
		 * @default false
		 */
		on: boolean;
		/**
		 * @description Schedule for switching the log file in cron format
		 * @type {string}
		 * @default '0 0 * * *'
		 */
		schedule?: string;
	};

	cleaning?: {
		/**
		 * @description Enables log file cleaning
		 * @type {boolean}
		 * @default false
		 */
		on: boolean;
		/**
		 * @description Schedule for cleaning the log files in cron format
		 * @type {string}
		 * @default '0 0 * * *'
		 */
		schedule?: string;
		/**
		 * @description Log file lifetime
		 * @type {TLifeTime}
		 * @default '14D'
		 */
		timeUntilCleaning?: TLifeTime;
	};

	archiving?: {
		/**
		 * @description Enables log file archiving
		 * @type {boolean}
		 * @default false
		 */
		on: boolean;
		/**
		 * @description Schedule for archiving the log files in cron format
		 * @type {string}
		 * @default '0 0 * * *'
		 */
		schedule?: string;
		/**
		 * @description Method to determine when to archive based on time
		 * @type {TLifeTime}
		 * @default cleaning.lifetime / 2
		 */
		timeUntilArchiving?: TLifeTime;
	};

	/**
	 * @description Maximum file size in bytes
	 * @type {number}
	 * @default Infinity
	 */
	maxFileSize?: number;

	/**
	 * @description Enables debug mode
	 * @type {boolean}
	 * @default false
	 */
	debug?: boolean;
}
