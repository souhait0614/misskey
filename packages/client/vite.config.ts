import * as fs from 'fs';
import pluginVue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import locales from '../../locales';
import meta from '../../package.json';
import pluginJson5 from './vite.json5';

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.json5', '.svg', '.sass', '.scss', '.css', '.vue'];

export default defineConfig(({ command, mode }) => {
	fs.mkdirSync(__dirname + '/../../built', { recursive: true });
	fs.writeFileSync(__dirname + '/../../built/meta.json', JSON.stringify({ version: meta.version }), 'utf-8');

	return {
		base: '/assets/',

		plugins: [
			pluginVue({
				reactivityTransform: true,
			}),
			pluginJson5(),
		],

		resolve: {
			extensions,
			alias: {
				'@/': __dirname + '/src/',
				'/client-assets/': __dirname + '/assets/',
				'/static-assets/': __dirname + '/../backend/assets/',
			},
		},

		define: {
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(Object.entries(locales).map(([k, v]) => [k, v._lang_])),
			_ENV_: JSON.stringify(process.env.NODE_ENV),
			_DEV_: process.env.NODE_ENV !== 'production',
			_PERF_PREFIX_: JSON.stringify('Misskey:'),
			_DATA_TRANSFER_DRIVE_FILE_: JSON.stringify('mk_drive_file'),
			_DATA_TRANSFER_DRIVE_FOLDER_: JSON.stringify('mk_drive_folder'),
			_DATA_TRANSFER_DECK_COLUMN_: JSON.stringify('mk_deck_column'),
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
		},

		// https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
		optimizeDeps: {
			include: ['misskey-js'],
		},

		build: {
			target: [
				'chrome100',
				'firefox100',
				'safari15',
			],
			manifest: 'manifest.json',
			rollupOptions: {
				input: {
					app: './src/init.ts',
				},
				output: {
					manualChunks: {
						vue: ['vue'],
					},
				},
			},
			cssCodeSplit: true,
			outDir: __dirname + '/../../built/_client_dist_',
			assetsDir: '.',
			emptyOutDir: false,
			sourcemap: process.env.NODE_ENV !== 'production',
			reportCompressedSize: false,

			// https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
			commonjsOptions: {
				include: [/misskey-js/, /node_modules/],
			},
		},
	};
});
