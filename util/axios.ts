import fetch from 'node-fetch'
import merge from './merge'

/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type HTTPMethod = 'get'|'post'|'put'|'patch'|'delete'|'options'|'head'|'GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'OPTIONS'|'HEAD'

type Options = {
    url?: string
    method?: HTTPMethod
    headers?: Headers
    body?: FormData|string|object
    responseType?: 'text'|'json'|'stream'|'blob'|'arrayBuffer'|'formData'|'stream'
    params?: Record<string,any>|URLSearchParams
    paramsSerializer?: (params: Options['params']) => string
    withCredentials?: boolean
    auth?: string
    xsrfCookieName?: string
    xsrfHeaderName?: string
    validateStatus?: (status: number) => boolean
    transformRequest?: Array<(body: any, headers: Headers) => any>
    baseURL?: string
    data?: any
}

type Headers = {
    [key: string]: string
}

type Response<T> = {
    status: number
    statusText: string
    config: Options
    data: T
    headers: Headers
    redirect: boolean
    url: string
    type: ResponseType
    body: ReadableStream<Uint8Array> | null
    bodyUsed: boolean
}

/**
 * @typedef BodylessMethod
 * @type {<T=any>(url: string, config?: Options) => Promise<Response<T>>}
 */

/**
 * @typedef BodyMethod
 * @type {<T=any>(url: string, body?: any, config?: Options) => Promise<Response<T>>}
 */

/** */
export default (function create(defaults: Options = {}) {

	/**
	 * @public
	 * @template T
	 * @type {(<T = any>(config?: Options) => Promise<Response<T>>) | (<T = any>(url: string, config?: Options) => Promise<Response<T>>)}
	 */
	redaxios.request = redaxios;

	redaxios.get = <T>(url: string|Options, config: Options = {}) => redaxios<T>(url, config, 'get');
	redaxios.delete = <T>(url: string|Options, config: Options = {}) => redaxios<T>(url, config, 'delete');
	redaxios.options = <T>(url: string|Options, config: Options = {}) => redaxios<T>(url, config, 'options');
	redaxios.post = <T>(url: string|Options, data: any = {}, config: Options = {}) => redaxios<T>(url, config, 'post', data);
	redaxios.put = <T>(url: string|Options, data: any = {}, config: Options = {}) => redaxios<T>(url, config, 'put', data);
	redaxios.patch = <T>(url: string|Options, data: any = {}, config: Options = {}) => redaxios<T>(url, config, 'patch', data);

	/**
	 * Issues a request.
	 * @param {string | Options} url
	 * @param {Options} [config]
	 * @param {any} [_method]
	 * @param {any} [_data]
	 * @returns {Promise<Response<T>>}
	 */
	function redaxios<T>(url: string|Options, config: Options = {}, _method?: HTTPMethod, _data?: any): Promise<Response<T>> {
		if (typeof url !== 'string') {
			config = url;
			url = <string>config.url;
    }

		const response = /** @type {Response<any>} */ ({ config });

		/** @type {Options} */
		const options = merge<Options[]>(defaults, config || {});

		const customHeaders: Headers = {};

		let data = _data || options.data;

		(options.transformRequest || []).map((f) => {
			data = f(data, options.headers) || data;
		});

		if (data && typeof data === 'object' && typeof data.append !== 'function') {
			data = JSON.stringify(data);
			customHeaders['content-type'] = 'application/json';
		}

		if (options.auth) {
			customHeaders.authorization = options.auth;
		}

		if (options.baseURL) {
			url = new URL(url, options.baseURL) + '';
		}

		if (options.params) {
			const divider = ~url.indexOf('?') ? '&' : '?';
			const query = options.paramsSerializer
				? options.paramsSerializer(options.params)
				: new URLSearchParams(options.params);
			url += divider + query;
		}


		return fetch(url, {
			method: _method || options.method,
			body: data,
			headers: merge<Headers[]>(options.headers || {}, customHeaders),
			// credentials: options.withCredentials ? 'include' : undefined
		}).then((res) => {
			for (const i in res) {
				if (typeof res[i] != 'function') response[i] = res[i];
			}

			const ok = options.validateStatus ? options.validateStatus(res.status) : res.ok;
			if (!ok) return Promise.reject(response);

			if (options.responseType == 'stream') {
				response.data = res.body;
				return response;
			}

			return res[options.responseType || 'text']()
				.then((data) => {
					response.data = data;
					// its okay if this fails: response.data will be the unparsed value:
					response.data = JSON.parse(data);
				})
				.catch(Object)
				.then(() => response);
		});
	}

	/**
	 * @public
	 * @type {AbortController}
	 */
	redaxios.CancelToken = /** @type {any} */ (typeof AbortController == 'function' ? AbortController : Object);

	/**
	 * @public
	 * @type {Options}
	 */
	redaxios.defaults = defaults;

	/**
	 * @public
	 */
	redaxios.create = create;

	return redaxios;
})({});