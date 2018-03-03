import React from 'react';
import { jsonServerRestClient, Admin, Resource } from 'admin-on-rest';
import czechMessages from 'aor-language-czech';

import { ClientList } from './clients';

const messages = {
    'cs': czechMessages,
};

const App = () => (
    <Admin restClient={jsonServerRestClient('http://jsonplaceholder.typicode.com')} locale="cs" messages={messages}>
        <Resource name="users" list={ClientList} />
    </Admin>
);

export default App;