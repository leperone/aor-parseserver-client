# aor-parseserver-client

An [admin-on-rest](https://github.com/marmelab/admin-on-rest) client for [Parse Server](https://github.com/ParsePlatform/parse-server).


## Installation

```sh
npm install aor-parseserver-client --save
```

## Usage


### As a parameter of the `<Admin>` component
```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import { PostList } from './posts';
import { RestClient } from 'aor-parseserver-client';

const parseConfig = {
	URL : 'https://my-app-url.com/parse',
	'APP-ID' : 'MyAppId',
	'REST-API-KEY' : 'MyRestAPIKey',
};

const App = () => (
    <Admin restClient={RestClient(parseConfig)} >
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```


### As a standalone function
```js
import React from 'react';
import { RestClient } from 'aor-parseserver-client';
import { showNotification } from 'admin-on-rest';

const parseConfig = {
	URL : 'https://my-app-url.com/parse',
	'APP-ID' : 'MyAppId',
	'REST-API-KEY' : 'MyRestAPIKey',
};
const client = RestClient(parseConfig);

const d = new Date();
d.setDate(d.getDate() - 360);

client('GET_LIST', 'comments', 
		{  
            pagination: {page: 1, perPage: 20}, 
            sort: {field:'createdAt', order:'DESC'}, 
            filter: {foo: 'bar', createdAt: {'$gte':{'__type':'Date', 'iso': d }}},
            include: 'post, user' 
        })
        .then((response) => {
        	console.log(JSON.stringify(response));
            showNotification('ok');
        });
```


### Auth Client
The package lets you manage the login/logout process implementing an optional `authClient` prop of the `Admin` component [(see documentation)](https://marmelab.com/admin-on-rest/Authentication.html).  
It stores a `parseToken` in  `localStorage` and passes it at every request as a `X-Parse-Session-Token` header.  


```js
// in src/App.js
...
import {RestClient, AuthClient} from 'aor-parseserver-client';

const App = () => (
    <Admin restClient={RestClient(parseConfig)} authClient={AuthClient(parseConfig)}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

## Changelog

### v0.3.0
  * Add support for `include` parameter 
  * Fix HTTP 400 error handling

## License

This library is licensed under the [MIT Licence](LICENSE).
