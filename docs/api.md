# api document

## end points

### hooks

- GET /hooks/{repo}
- POST /hooks/{repo}

### services

- GET /services :lock:
- GET /services/status :lock:
- GET /services/available
- PUT /services/{name} :lock:
- DELETE /services/{name} :lock:
- POST /services/{name}/start :lock:
- POST /services/{name}/stop :lock:
- POST /services/{name}/restart :lock:
- GET /services/{name}/logs :lock:
- GET /services/{name}/env :lock:
- POST /services/{name}/env/update :lock:

### credentials

- POST /credentials/update :lock:
- POST /credentials/fido/register :lock:

## details

### overall

Some APIs requires authentication. Authentication information only available via cookie in the meantime.

### GET /hooks/{repo}

Trigger rebuild container (for git webhook)
- GET /services/available

- repo: repository name
- key: authorization key

### POST /hooks/{repo}

Trigger rebuild container (for git webhook)

- repo: repository name
- key: authorization key

### GET /services :lock:

List services

### GET /services/status :lock:

Get statuses for all services.

### GET /services/available

Check service name availability

- name: service name

### PUT /services/{name} :lock:

Create new container

- name: service name
- template: template name
- external: external git uri

### DELETE /services/{name} :lock:

Delete existing container

- name: service name

### POST /services/{name}/start :lock:

Build container and start.

- name: service name

### POST /services/{name}/stop :lock:

Stop container.

- name: service name

### POST /services/{name}/restart :lock:

Restart container.

- name: service name
- quick: if set value, restart container without rebuild.

### GET /services/{name}/logs :lock:

Get logs from container.

- name: service name

### GET /services/{name}/env :lock:

Get env variables from container.

- name: service name

### POST /services/{name}/env/update :lock:

Update custom env variables to container.

- name: service name
- env: JSON object for env variables

### POST /credentials/update :lock:

Update git credential

- password: new password

### POST /credentials/fido/register :lock:

Register FIDO2.0 public key

- id: key id
- key: public key

## Socket.IO Endpoints

- /term :lock:
- /log :lock:
- /status :lock:

### /term

Access isolated cloud shell.

### /log

Realtime log stream from docker.

### /ststus

Overall container status stream.
