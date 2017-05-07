import { queryParameters, fetchJson } from './fetch';
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE,
} from 'admin-on-rest/lib/rest/types';

export const FUNCTION = 'FUNCTION';


function filterQuery(obj) {
	let result = {};
	Object.keys(obj).forEach(function(x){
		if (typeof obj[x] === 'string' )
			result[x] = {"$regex":obj[x]};
		else result[x] = obj[x];
	});
	if (Object.keys(result).length >0)
		return JSON.stringify(result);
	return null;
}

export default (parseConfig, httpClient = fetchJson) => {
	
	/**
	 * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
	 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
	 * @param {Object} params The REST request params, depending on the type
	 * @returns {Object} { url, options } The HTTP request parameters
	 */
	const convertRESTRequestToHTTP = (type, resource, params) => {
	    let url = '';
	    
	    const token = localStorage.getItem('parseToken')
	    
	    let options = {};
	    options.headers = new Headers({ Accept: 'application/json' });
	    options.headers.set('X-Parse-Application-Id', parseConfig['APP-ID']);
	    options.headers.set('X-Parse-REST-API-Key', parseConfig['REST-API-KEY']);
	    
	    if (token !== null){
		    options.headers.set('X-Parse-Session-Token', token);
	    }
	    
	    switch (type) {
	    case GET_LIST: {
	        const page = (params.pagination && params.pagination.page != null) ? params.pagination.page : 1;
			const perPage = (params.pagination && params.pagination.perPage != null) ? params.pagination.perPage : 10;
			const field = (params.sort && params.sort.field != null) ? params.sort.field : "createdAt";
			const order = (params.sort && params.sort.order != null) ? params.sort.order : "ASC";
			const filter = (params.filter != null) ? filterQuery(params.filter) : null;
			const include = (params.include != null) ? params.include.replace(/\s/g, "") : null;
	        const query = {
		        count: 1,
		        order: (order === "DESC" ? "-"+field : field),
		        limit: perPage,
		        skip: (page - 1) * perPage,
	        };
	        if (include != null){
		        query.include = include;
	        }
	        if (filter != null){
		        query.where = filter;
	        }
	        url = `${parseConfig.URL}/classes/${resource}?${queryParameters(query)}`;
	        break;
	    }
	    case GET_ONE:
	        url = `${parseConfig.URL}/classes/${resource}/${params.id}`;
	        break;
	    case GET_MANY: {
	        const query = {
	            where: JSON.stringify({ "objectId": {"$in":params.ids} }),
	        };
	        url = `${parseConfig.URL}/classes/${resource}?${queryParameters(query)}`;
	        break;
	    }
	    case GET_MANY_REFERENCE: {
	        const page = (params.pagination && params.pagination.page != null) ? params.pagination.page : 1;
			const perPage = (params.pagination && params.pagination.perPage != null) ? params.pagination.perPage : 10;
			const field = (params.sort && params.sort.field != null) ? params.sort.field : "createdAt";
			const order = (params.sort && params.sort.order != null) ? params.sort.order : "ASC";
	        const query = {
	            order: (order === "DESC" ? "-"+field : field),
		        limit: perPage,
		        skip: (page - 1) * perPage,
		        where: JSON.stringify({[params.target] : params.id}),
	        };
	        url = `${parseConfig.URL}/classes/${resource}?${queryParameters(query)}`;
	        break;
	    }
	    case UPDATE:
	        url = `${parseConfig.URL}/classes/${resource}/${params.id}`;
	        options.method = 'PUT';
	        delete params.data.id;
	        delete params.data.createdAt;
	        delete params.data.updatedAt;
	        options.body = JSON.stringify(params.data);
	        break;
	    case CREATE:
	        url = `${parseConfig.URL}/classes/${resource}`;
	        options.method = 'POST';
	        options.body = JSON.stringify(params.data);
	        break;
	    case DELETE:
	        url = `${parseConfig.URL}/classes/${resource}/${params.id}`;
	        options.method = 'DELETE';
	        break;
	    case FUNCTION:
	        url = `${parseConfig.URL}/functions/${resource}`;
	        options.method = 'POST';
	        options.body = JSON.stringify(params.data);
	        break;
	    default:
	        throw new Error(`Unsupported fetch action type ${type}`);
	    }
	    return { url, options };
	};
	
	/**
	 * @param {Object} response HTTP response from fetch()
	 * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
	 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
	 * @param {Object} params The REST request params, depending on the type
	 * @returns {Object} REST response
	 */
	const convertHTTPResponseToREST = (response, type, resource, params) => {
	    const { json } = response;
	    switch (type) {
	    case GET_LIST:
	    case GET_MANY_REFERENCE:
	        return {
	            data : json.results.map(x => ({...x, id: x.objectId})),
	            total: json.count,
	        };
	    case CREATE:
	    case GET_ONE:
	    case UPDATE:
	    case DELETE:
			return { 
				data: { ...json, id: json.objectId },
			};			
	    case GET_MANY:
	    	return {
	            data : json.results.map(x => ({...x, id: x.objectId})),
	        };
	    default:
	        return json;
	    }
	};
	
	/**
	 * @param {string} type Request type, e.g GET_LIST
	 * @param {string} resource Resource name, e.g. "posts"
	 * @param {Object} payload Request parameters. Depends on the request type
	 * @returns {Promise} the Promise for a REST response
	 */
	return (type, resource, params) => {
	    const { url, options } = convertRESTRequestToHTTP(type, resource, params);
	    return fetchJson(url, options)
	        .then(response => convertHTTPResponseToREST(response, type, resource, params));
	};
}