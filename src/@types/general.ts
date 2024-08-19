export type TRunMode = '*' | 'production' | 'development';
export type TLifeTime =
	| `${number}ms`
	| `${number}s`
	| `${number}m`
	| `${number}h`
	| `${number}D`
	| `${number}W`
	| `${number}M`;
export type TCreateLogLevel = '*' | 'log' | 'error' | 'info' | 'warn' | 'debug' | 'confirm';
export type TLogLevel = 'log' | 'error' | 'info' | 'warn' | 'debug' | 'confirm';
export type ILogLevelFlags = Record<TLogLevel, boolean>;

export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;
export interface IRecord {
	info: {
		time: Date;
		level: TLogLevel;
	};
	payload: unknown[];
}

export interface IPacket {
	record: IRecord;
	from: string;
	to: string;
}
