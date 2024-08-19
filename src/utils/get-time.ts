export function nTime(value: number): string {
	if (value < 10) return `0${value}`;
	else return `${value}`;
}
export function getFullTime(date: Date): string {
	return `[${nTime(date.getDate())}.${nTime(date.getMonth() + 1)}.${date.getFullYear()}|${nTime(date.getHours())}:${nTime(date.getMinutes())}:${nTime(date.getSeconds())}]`;
}

export function getOnlyDate(date: Date): string {
	return `[${nTime(date.getDate())}.${nTime(date.getMonth() + 1)}.${date.getFullYear()}]`;
}

export function getOnlyTime(date: Date): string {
	return `[${nTime(date.getHours())}:${nTime(date.getMinutes())}:${nTime(date.getSeconds())}]`;
}
