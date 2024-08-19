import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'], // Входной файл или файлы
	format: ['cjs'], // Форматы сборки: ESM и CommonJS
	dts: true, // Генерация файлов деклараций (.d.ts)
	splitting: true, // Разделение кода (для ESM)
	sourcemap: true, // Генерация source maps
	clean: true, // Очистка выходной директории перед сборкой
	minify: false, // Минификация с использованием Terser
	treeshake: true, // Удаление неиспользуемого кода
	target: 'es2017', // Целевая версия ECMAScript
	outDir: 'dist', // Выходная директория
	shims: true, // Включение шимов для глобальных объектов
	bundle: true, // Создание единого бандла
	onSuccess: 'echo Build completed!', // Команда, которая выполняется после успешной сборки
	platform: 'node', // Платформа Node.js
	tsconfig: './tsconfig.json', // Указание конкретного tsconfig файла
	noExternal: [/.*?/g],
});
