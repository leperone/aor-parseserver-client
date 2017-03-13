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
import {RestClient, AuthClient} from 'aor-parseserver-client';
import { PostList } from './posts';

const parseConfig = {
	URL : 'https://my-app-url.com/parse',
	'APP-ID' : 'MyAppId',
	'REST-API-KEY' : 'MyRestAPIKey',
};

const App = () => (
    <Admin restClient={RestClient(parseConfig)} authClient={AuthClient(parseConfig)}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

## License

This library is licensed under the [MIT Licence](LICENSE).
