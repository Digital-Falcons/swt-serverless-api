import { resolve } from 'path';
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'MyLib',
			formats: ['es'],
			fileName: 'my-lib',
		},
	},
	plugins: [dts()],
});
