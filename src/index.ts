//#region Import types
import type { IConsumerOptions } from './@types/instances/consumer';
import type { IProducerOptions } from './@types/instances/producer';
//#endregion

//#region Imports
import Consumer from './bin/Consumer';
import Producer from './bin/Producer';
import LogStream from './bin/Stream';
//#endregion

/**
 * @class FaseLog Instance builder for a fast logging system
 */
export default class Log {
	/**
	 * @description Creates a producer instance
	 * @param {IProducerOptions} params Parameters for creating a producer
	 * @returns {Producer} Producer instance
	 */
	static createProducer(params?: IProducerOptions): Producer {
		return new Producer(params);
	}

	/**
	 * @description Creates a consumer instance
	 * @param {IConsumerOptions} params Parameters for creating a consumer
	 * @returns {Consumer} Consumer instance
	 */
	static createConsumer(params?: IConsumerOptions): Consumer {
		return new Consumer(params);
	}

	/**
	 * @description Creates a recording stream with 1 producer and 1 consumer.
	 * This is a simplified interface for interacting with the logging library
	 * @param {IProducerOptions} paramsProducer Parameters for creating a producer
	 * @param {IConsumerOptions} paramsConsumer Parameters for creating a consumer
	 * @returns {LogStream} Producer instance
	 */
	static createStream(paramsProducer?: IProducerOptions, paramsConsumer?: IConsumerOptions): LogStream {
		return new LogStream(paramsProducer, paramsConsumer);
	}
}
