import type { HttpMethod } from '../bootstraper';

type BrunoMeta = {
	name: string;
	type: 'http' | 'grpc' | 'ws' | 'graphql';
	seq: number; // to help ordering if needed
};

type DataType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export type KeyTypeValue = {
	key: string;
	type: DataType;
	value: string;
};

function generateDummyValue(type: DataType): string {
	switch (type) {
		case 'string':
			return '"lorem ipsum"';
		case 'number':
			return '248';
		case 'boolean':
			return 'true';
		case 'array':
			return '[1, 2, 3]';
		default:
			return 'object {}';
	}
}

export class BrunoRequest {
	constructor(
		private meta: BrunoMeta,
		private baseURL: string,
		private httpMethod: HttpMethod,
		private url: string,
		private headers?: KeyTypeValue[],
		private queryParams?: KeyTypeValue[],
		private pathParams?: KeyTypeValue[],
		private bodyParams?: KeyTypeValue[],
	) {}

	getFilename() {
		return `${this.meta.name.replace(/\//g, '_')}.bru`;
	}

	createMetaString() {
		return `meta {
  name: "${this.meta.name}"
  type: "${this.meta.type}"
  seq: ${this.meta.seq}
}`;
	}

	createRequestString() {
		let headersStr = '';
		if (this?.headers && this.headers.length > 0) {
			headersStr = 'headers {\n';
			for (const header of this.headers) {
				headersStr += `  ${header.key}: ${generateDummyValue(header.type)}\n`;
			}
			headersStr += '}\n';
		}

		let queryParamsStr = '';

		if (this?.queryParams && this.queryParams.length > 0) {
			queryParamsStr = 'params:query {\n';
			for (const param of this.queryParams) {
				console.log(param);

				queryParamsStr += `  ${param.key}: ${generateDummyValue(param.type)}\n`;
			}
			queryParamsStr += '}\n';
		}

		let pathParamsStr = '';
		if (this?.pathParams && this.pathParams.length > 0) {
			pathParamsStr = 'params:path {\n';
			for (const param of this.pathParams) {
				pathParamsStr += `  ${param.key}: ${generateDummyValue(param.type)}\n`;
			}
			pathParamsStr += '}\n';
		}

		let bodyParamsStr = '';
		if (this?.bodyParams && this.bodyParams.length > 0) {
			bodyParamsStr = 'body:json {\n';
			// for (const param of this.bodyParams) {
			//   bodyParamsStr += `  "${param.key}": ${generateDummyValue(
			//     param.type
			//   )},\n`;
			// }
			const jsonObject: any = {};
			for (const param of this.bodyParams) {
				jsonObject[param.key] = generateDummyValue(param.type);
			}
			bodyParamsStr += JSON.stringify(jsonObject, null, 2);
			bodyParamsStr += '\n}\n';
		}

		const queryString = this.queryParams?.map((p) => `${p.key}=${encodeURIComponent(generateDummyValue(p.type))}`).join('&');

		return `${this.httpMethod} {
  url: ${this.baseURL}${this.url}${this.queryParams?.length ? `?${queryString}` : ''}
  body: json
  auth: inherit
}
  
${headersStr}
${queryParamsStr}
${pathParamsStr}
${bodyParamsStr}
`;
	}

	toString() {
		return `${this.createMetaString()}

${this.createRequestString()}`;
	}
}
