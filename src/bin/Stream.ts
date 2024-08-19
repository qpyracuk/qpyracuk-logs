//#region Import types
import type { IProducerOptions } from '../@types/instances/producer';
import type { IConsumerOptions } from '../@types/instances/consumer';
//#endregion

//#region Imports
import Consumer from './Consumer';
import Producer from './Producer';
//#endregion

export default class LogStream {
	private $_producer: Producer;

	constructor(paramsProducer?: IProducerOptions, paramsConsumer?: IConsumerOptions) {
		if (paramsProducer === undefined) paramsProducer = {};
		this.$_producer = new Producer(paramsProducer);

		if (paramsConsumer === undefined)
			paramsConsumer = {
				listen: [this.$_producer],
			};
		else if (paramsConsumer.listen === undefined) paramsConsumer.listen = [this.$_producer];
		else if (Array.isArray(paramsConsumer.listen)) paramsConsumer.listen.push(this.$_producer);
		else if (paramsConsumer.listen instanceof Consumer)
			paramsConsumer.listen = [this.$_producer, paramsConsumer.listen];
		else paramsConsumer.listen = [this.$_producer];
		new Consumer(paramsConsumer);
	}

	log(message?: unknown, ...optionalParams: unknown[]) {
		this.$_producer.log(message, ...optionalParams);
	}

	error(message?: unknown, ...optionalParams: unknown[]) {
		this.$_producer.error(message, ...optionalParams);
	}

	info(message?: unknown, ...optionalParams: unknown[]) {
		this.$_producer.info(message, ...optionalParams);
	}

	confirm(message?: unknown, ...optionalParams: unknown[]) {
		this.$_producer.confirm(message, ...optionalParams);
	}

	debug(message?: unknown, ...optionalParams: unknown[]) {
		this.$_producer.debug(message, ...optionalParams);
	}

	warn(message?: unknown, ...optionalParams: unknown[]) {
		this.$_producer.warn(message, ...optionalParams);
	}
}
