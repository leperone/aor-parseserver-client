# aor-parseserver-client

[Parse Server](https://github.com/ParsePlatform/parse-server) client for [admin-on-rest](https://github.com/marmelab/admin-on-rest).
## Installation

```sh
npm install aor-parseserver-client --save
```

## Usage

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import { PostList } from './posts';
import {RestClient} from 'aor-parseserver-client';

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

## License

This library is licensed under the [MIT Licence](LICENSE).
