Minamo private PaaS
===

Concept
---

- Build private PaaS on your Server.
- Minamo built on these OpenSource Technologies.
    - Git
    - NodeJS
    - Docker
    - Redis
    - Nginx

```

+--------+  git push   +---------------+  Deploy   +--------+
| Client | ----------> | Minamo Server | --------> | Docker |
+--------+             +---------------+           +--------+

```

Install
---

1. Install dependency packages.
    - refer install.sh
2. Configure nginx
    - setup your domain in nginx.conf
    - include nginx.conf from /etc/nginx/nginx.conf
3. Configure your access rights.
    - your unix account need to access docker server.
4. Run services
    - Nginx
    - Docker
5. Install dependency npm packages.
    - ``npm install``
6. Run Minamo engine.
    - ``node index.js``

How to Use
---

1. Open management console.
    - ``http://your.domain/console``
2. Create first container.
3. Clone repository.
    - ``http://git.your.domain/name.git``
4. Add package.json and server.js to your repository.
    - package.json requires scripts.start.
5. Push repository to Minamo.
6. Have a coffee.
7. Access to your service!
    - ``http://name.your.domain/``

Samples
---

### package.json

```javascript
{
  "name": "SampleService",
  "version": "0.0.1",
  "dependencies": {
    "express": "*"
  }
}
```

### server.js

```javascript
let express = require('express');
let app = express();

app.get('/', function(req, res){
  res.send('Hello from Minamo!');
});

app.listen(process.env.PORT); // you needs to listen on process.env.PORT.
```

