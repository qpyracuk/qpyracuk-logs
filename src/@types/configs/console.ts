import { TRunMode, DeepPartial } from '../general';
/**
 * @description Fixed console configuration
 */
export interface IConsole {
	/**
	 * @description Console output switch
	 * @default true Console output is enabled by default
	 */
	on: boolean;
	/**
	 * @description Selecting the NODE_ENV mode in which console output will work
	 * @default 'development' Console output will only be available when NODE_ENV === 'development'
	 */
	runMode: TRunMode;
	/**
	 * @description Configuration of beautiful console output
	 */
	pretty: {
		/**
		 * @description Beautiful Output Switch
		 * @default true By default, beautiful output is enabled
		 */
		on: boolean;
		/**
		 * @description
		 * @default ''
		 */
		title: string;
		/**
		 * @description Add recording output time to console
		 * @default true The log entry creation time is added to the console output
		 */
		time: boolean;
		/**
		 * @description Add emoticons corresponding to the logging type to the console
		 * @default true Emoticons are displayed
		 */
		emoji: boolean;
	};
}

/**
 * @description Console output configuration interface
 */
export type ICreateConsole = DeepPartial<IConsole>;
