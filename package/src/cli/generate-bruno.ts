import { mkdirSync, writeFileSync } from 'fs';

import minimist from 'minimist';
import type { IntrospectionObject } from '../bootstraper/types.js';
import { BrunoRequest } from './bruno.js';
import { folderExists, mapSchemas } from './utils/common-utils.js';

const argv = minimist(process.argv.slice(2));
const outDir = argv.outDir || './generated';
const introspectURL = argv.url || 'http://localhost:8787/introspect';
const baseURL = argv.baseURL || 'http://localhost:8787';

fetch(introspectURL)
	.then((res) => res.json() as Promise<IntrospectionObject[]>)
	.then((introspectionObjects) => {
		if (!folderExists(outDir)) {
			console.log('\x1b[33m', `Folder at ${outDir} not exist, create new one.`);
			mkdirSync(outDir);
		} else {
			console.log('\x1b[36m', `Folder at ${outDir} exists.`);
		}
		introspectionObjects.forEach((obj, id) => {
			const bruno = new BrunoRequest(
				{
					name: obj.name,
					type: 'http',
					seq: id + 1,
				},
				baseURL,
				obj.method,
				obj.path,
				mapSchemas(obj.schema?.headers || []),
				mapSchemas(obj.schema?.query || []),
				mapSchemas(obj.schema?.params || []),
				mapSchemas(obj.schema?.body || []),
			);
			writeFileSync(`${outDir}/${bruno.getFilename()}`, bruno.toString());
		});
		console.log('\x1b[36m', 'Finished generating bruno files.');
	})
	.catch((err) => {
		console.error('\x1b[31m', 'Error fetching introspection data:', err);
	});
