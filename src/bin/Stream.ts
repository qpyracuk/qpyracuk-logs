//#region Import types
import type { IProducerOptions } from '../@types/instances/producer';
import type { IConsumerOptions } from '../@types/instances/consumer';
//#endregion

//#region Imports
import Consumer from './Consumer';
import Producer from './Producer';
//#endregion

/**
 * LogStream class that integrates both Producer and Consumer functionalities.
 * It allows for streamlined logging operations by handling the creation and connection
 * between Producer and Consumer instances.
 */
export default class LogStream {
	private producer: Producer;

	/**
	 * Initializes a new instance of the LogStream class.
	 *
	 * @param {IProducerOptions} [paramsProducer] - Configuration options for the Producer instance.
	 * @param {IConsumerOptions} [paramsConsumer] - Configuration options for the Consumer instance.
	 *
	 * The constructor sets up the producer with the provided options and ensures
	 * that the consumer is properly configured to listen to the producer's events.
	 */
	constructor(paramsProducer?: IProducerOptions, paramsConsumer?: IConsumerOptions) {
		if (paramsProducer === undefined) paramsProducer = {};
		this.producer = new Producer(paramsProducer);

		if (paramsConsumer === undefined)
			paramsConsumer = {
				listen: [this.producer],
			};
		else if (paramsConsumer.listen === undefined) paramsConsumer.listen = [this.producer];
		else if (Array.isArray(paramsConsumer.listen)) paramsConsumer.listen.push(this.producer);
		else if (paramsConsumer.listen instanceof Consumer) paramsConsumer.listen = [this.producer, paramsConsumer.listen];
		else paramsConsumer.listen = [this.producer];
		new Consumer(paramsConsumer);
	}

	/**
	 * Logs a message at the 'log' level using the internal Producer instance.
	 *
	 * @param {unknown} [message] - The message to log.
	 * @param {...unknown[]} optionalParams - Additional parameters to log.
	 */
	log(message?: unknown, ...optionalParams: unknown[]) {
		this.producer.log(message, ...optionalParams);
	}

	/**
	 * Logs a message at the 'error' level using the internal Producer instance.
	 *
	 * @param {unknown} [message] - The message to log.
	 * @param {...unknown[]} optionalParams - Additional parameters to log.
	 */
	error(message?: unknown, ...optionalParams: unknown[]) {
		this.producer.error(message, ...optionalParams);
	}

	/**
	 * Logs a message at the 'info' level using the internal Producer instance.
	 *
	 * @param {unknown} [message] - The message to log.
	 * @param {...unknown[]} optionalParams - Additional parameters to log.
	 */
	info(message?: unknown, ...optionalParams: unknown[]) {
		this.producer.info(message, ...optionalParams);
	}

	/**
	 * Logs a message at the 'confirm' level using the internal Producer instance.
	 *
	 * @param {unknown} [message] - The message to log.
	 * @param {...unknown[]} optionalParams - Additional parameters to log.
	 */
	confirm(message?: unknown, ...optionalParams: unknown[]) {
		this.producer.confirm(message, ...optionalParams);
	}

	/**
	 * Logs a message at the 'debug' level using the internal Producer instance.
	 *
	 * @param {unknown} [message] - The message to log.
	 * @param {...unknown[]} optionalParams - Additional parameters to log.
	 */
	debug(message?: unknown, ...optionalParams: unknown[]) {
		this.producer.debug(message, ...optionalParams);
	}

	/**
	 * Logs a message at the 'warn' level using the internal Producer instance.
	 *
	 * @param {unknown} [message] - The message to log.
	 * @param {...unknown[]} optionalParams - Additional parameters to log.
	 */
	warn(message?: unknown, ...optionalParams: unknown[]) {
		this.producer.warn(message, ...optionalParams);
	}
}
