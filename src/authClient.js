import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK, AUTH_ERROR } from 'admin-on-rest';

export default (parseConfig) => {
	
	const manageAuth = (type, params) => {
	    let headers = new Headers({ 
			'Content-Type': 'application/json', 
			'X-Parse-Application-Id': parseConfig['APP-ID'], 
			'X-Parse-REST-API-Key': parseConfig['REST-API-KEY'] 
		});
	    
	    if (type === AUTH_LOGIN) {
	        const { username, password } = params;
	        const request = new Request(parseConfig.URL+'/login?username='+encodeURIComponent(username)+"&password="+encodeURIComponent(password), {
	            method: 'GET',
	            headers: headers,
	        });
	        return fetch(request)
	            .then(response => {
	                if (response.status < 200 || response.status >= 300) {
	                    throw new Error(response.statusText);
	                }
	                return response.json();
	            })
	            .then(function(response){
	                localStorage.setItem('parseToken', response.sessionToken);
	            });
	    }
	    if (type === AUTH_LOGOUT) {
		    if (localStorage.getItem('parseToken')){
		        headers.set('X-Parse-Session-Token', localStorage.getItem('parseToken'));
		        const request = new Request(parseConfig.URL+'/logout', {
		            method: 'POST',
		            headers: headers,
		        });
		        return fetch(request)
		        	.then(response => {
		                localStorage.removeItem('parseToken');
		                if (response.status < 200 || response.status >= 300) {
		                    response.json().then(function(object) {
						    	if (object.code !== 209){
								    throw new Error(object.error);
						    	}
						    })
		                }
		            })
	        }
	        localStorage.removeItem('parseToken');
	        return Promise.resolve();
	    }
	    if (type === AUTH_ERROR) {
	        const { status } = params;
	        if (status === 209) {
	            localStorage.removeItem('parseToken');
	            return Promise.reject();
	        }
	        return Promise.resolve();
	    }
	    if (type === AUTH_CHECK) {
	        return localStorage.getItem('parseToken') ? Promise.resolve() : Promise.reject();
	    }
	    return Promise.reject('Unkown method');
	};
	
	
	return (type, params) => {
		return manageAuth(type, params);
	};
}