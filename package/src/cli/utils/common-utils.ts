import { statSync } from 'fs';
import type { SWTZodSchema } from '../../bootstraper';
import type { KeyTypeValue } from '../bruno';

export function mapSchemas(schema: SWTZodSchema[]) {
	const kvs: KeyTypeValue[] = [];
	if (schema.length === 0) return [];
	if (schema.length === 1 && schema[0] && schema[0].type === 'object') {
		const props = schema[0].properties;
		for (const key in props) {
			const prop = props[key];
			kvs.push({
				key: key,
				type: prop.type,
				value: JSON.stringify(prop),
			});
		}
		return kvs;
	}
	for (const sch of schema) {
		kvs.push({
			key: sch.name || 'unknown',
			type: sch.type,
			value: JSON.stringify(sch),
		});
	}
	return kvs;
}

export function folderExists(path: string): boolean {
	try {
		const stat = statSync(path);
		return stat.isDirectory();
	} catch (err) {
		return false;
	}
}
