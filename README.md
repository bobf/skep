## Overview

_Skep_ is a monitoring dashboard for [_Docker Swarm_](https://docs.docker.com/engine/swarm/).

See [skepdocker.github.io](https://skepdocker.github.io/) for features, screenshots, etc..

You may find _Skep_ to be a useful addition to your toolbox along with projects like these:

* [Swarmpit](https://swarmpit.io/)
* [SwarmProm](https://github.com/stefanprodan/swarmprom)
* [swarm-dashboard](https://github.com/charypar/swarm-dashboard)
* [docker-swarm-visualizer](https://github.com/dockersamples/docker-swarm-visualizer)
* [portainer.io](https://www.portainer.io/)
* [Consul](https://www.consul.io/)

## Configuration/Setup

### Quickstart

Launch _Skep_ using the default configuration by running the following command on any _Swarm_ manager:
```
curl -sSL https://raw.githubusercontent.com/bobf/skep/master/docker-compose.yml |\
docker-compose -f - config |\
docker stack deploy -c - skep
```

_Skep_ will be available on any _Swarm_ node on port `8080`.

When you have finished evaluating _Skep_ you can remove the stack to destroy all services and networks:
```
docker stack rm skep
```

### Configuration

The _agent_ service is responsible for harvesting host and container metrics; configure this service as appropriate for your hardware/operating system setup.

See the sections below to configure each of _Skep_'s components. The provided [example docker-compose.yml](docker-compose.yml) can be used as a starting point.

When you have a `docker-compose.yml` that suits your requirements you can launch _Skep_ by executing the following command on any _Swarm_ manager:

```
docker-compose -f <your-compose-file.yml> config | docker stack deploy -c - skep
```

#### Front end web app

| Variable | Meaning | Example |
|-|-|-|
| `SKEP_PRIVATE_PORT` | Port used for internal communications between _Skep_ services. Do not publish this port. | `6666` _(default/recommended)_ |
| `SKEP_CHARTS_URL` | URL that the _charts_ service will be available on for handling chart requests. | `http://charts:8080/`

#### Agent

| Variable | Meaning | Example |
|-|-|-|
| `SKEP_APP_URL` | URL that agent containers will use to send metrics to _Skep_ web application | `http://app:6666/` _(default/recommended)_ |
| `DISKS` | Comma-separated list of disk devices to monitor (disk activity) | `sda,sdc` |
| `FILE_SYSTEMS` | Comma-separated list of file systems to monitor (available space) | `/hostfs/root,/hostfs/backups` (see [file systems](#file-systems)) |
| `NETWORK_INTERFACES` | Comma-separated list of network devices to monitor (traffic) **[not yet implemented]** | `eth0,eth3` |
| `COLLECT_INTERVAL` | Time in seconds to wait between gathering metrics. | `5` |
| `SAMPLE_DURATION` | _Minimum_ time in seconds to monitor disk I/O etc. Will accumulate for multiple devices. | `10` |
| `LOG_LEVEL` | By default, the agent only logs initial configuration on launch and errors. Set to `DEBUG` to log all statistics. | `INFO` _(default/recommended)_ |
| `SKEP_HOST` | Set to `docker-desktop` when running on Docker Desktop for Mac | `docker-desktop` |

#### Monitor

| Variable | Meaning | Example |
|-|-|-|
| `SKEP_APP_URL` | URL that agent containers will use to send metrics to _Skep_ web application | `http://app:6666/` _(default/recommended)_ |
| `SERVICE_URL_TEMPLATE` | URL template for service names | See [URL templating](#url-templating) |
| `IMAGE_URL_TEMPLATE` | URL template for image names | See [URL templating](#url-templating) |
| `LOG_LEVEL` | By default, the monitor only logs initial configuration on launch and errors. Set to `DEBUG` to log all statistics. | `INFO` _(default/recommended)_ |
| `COLLECT_INTERVAL` | Time in seconds to wait between gathering metrics. | `5` |
| `SAMPLE_DURATION` | _Minimum_ time in seconds to monitor disk I/O etc. Will accumulate for multiple devices. | `10` |

#### Monitor

| Variable | Meaning | Example |
|-|-|-|
| `SKEP_APP_URL` | URL that agent containers will use to send metrics to _Skep_ web application | `http://app:6666/` _(default/recommended)_ |
| `SERVICE_URL_TEMPLATE` | URL template for service names | See [URL templating](#url-templating) |
| `IMAGE_URL_TEMPLATE` | URL template for image names | See [URL templating](#url-templating) |
| `LOG_LEVEL` | By default, the monitor only logs initial configuration on launch and errors. Set to `DEBUG` to log all statistics. | `INFO` _(default/recommended)_ |
| `COLLECT_INTERVAL` | Time in seconds to wait between gathering metrics. | `5` |
| `SAMPLE_DURATION` | _Minimum_ time in seconds to _monitor_ disk I/O etc. Will accumulate for multiple devices. | `10` |

#### Charts

| Variable | Meaning | Example |
|-|-|-|
| `SKEP_APP_URL` | URL that agent containers will use to send metrics to _Skep_ web application | `http://app:6666/` _(default/recommended)_ |
| `SKEP_CHARTS_DB_PATH` | Path to statistics _SQLite3_ database. Mount a shared storage endpoint to this location if you want to retain data between restarts. | `/charts.db` _(default/recommended)_ |
| `SKEP_CHARTS_DB_PERSIST` | By default, the statistics database is re-initialised on startup. Set this variable to any value to retain data between restarts. | _(not set)_ |
| `LOG_LEVEL` | Application server log level. | `INFO` _(default/recommended)_ |

## Deployment

_Skep_ uses the [gunicorn](https://gunicorn.org/) web server in conjunction with [Flask](https://palletsprojects.com/p/flask/) and [Flask-SocketIO](https://github.com/miguelgrinberg/Flask-SocketIO).

To deploy _Skep_ behind _Nginx_ the following configuration can be used:
```
upstream skep {
  # Docker Swarm Nodes:
  server node1:8080;
  server node2:8080;
  server node3:8080;
}

server {
    server_name skep.example.com;

    location / {
        proxy_pass http://skep;
    }

    location /socket.io {
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Origin "";
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass http://skep;
    }

    listen 80;
    listen [::]:80;
}
```

<a name="file-systems"></a>
## File Systems

To monitor a file system it must be mounted into the agent as a [_Docker_ bind mount](https://docs.docker.com/storage/bind-mounts/). The `FILE_SYSTEMS` environment variable should refer to the **destination** of the bind mount. _Skep_ uses the base path `/hostfs` for mounting host file systems but any valid path is acceptable.

For example, to monitor the root file system, the following configuration might be used:

```yaml
  stats:
    image: skep/stats

    volumes:
      - "/:/hostfs/root:ro"

    environment:
      FILE_SYSTEMS: '/hostfs/root'
```

<a name="url-templating"></a>
## URL Templating

URL templating is supported for service names and image IDs. When the relevant environment variable is set, service names and image IDs will be rendered as hyperlinks according to a provided _Python_ format string. See the table below for available parameters:

### Service Name

| Parameter | Meaning | Example |
|-|-|-|
| `name` | Name of service | `skep_app` |
| `id` | Service ID | `yw1iaod282a7` |

### Image

| Parameter | Meaning | Example |
|-|-|-|
| `organization` | Image organization owner | `skep` |
| `repository` | Image repository name | `app` |
| `tag` | Image tag | `latest` |

### Example

```
# .env
SERVICE_URL_TEMPLATE=https://github.com/bobf/{name}
IMAGE_URL_TEMPLATE=https://hub.docker.com/r/{organization}/{repository}
```

## Architecture

_Skep_ is comprised of four services:

* An _agent_ which is deployed globally (i.e. to all _Swarm_ nodes);
* A _monitor_ which must be deployed to one manager node;
* A _charts_ service which stores and calculates chart data which can be deployed to any node and must have only one replica;
* A web _app_ that can be deployed to any node and must have only one replica.

The _agent_ periodically harvests system and container metrics which are sent to the _charts_ and _app_ services; the _app_ service forwards the data to the [_React_](https://reactjs.org/) front end using [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) / [socket.io](https://socket.io/). The _charts_ service retains the data in an [SQLite3](https://www.sqlite.org/version3.html) database.

Chart requests are sent to the _app_ which forwards to the _charts_ service. A confirmation is immediately returned to the front end while the _charts_ service uses one of its worker processes to render the chart data. When the data has been compiled it is sent back to the front end via a _WebSocket_ event.

_Redux_ is used in the front end to manage events and data storage/manipulation.

_Agents_ use bind mounts to access metrics from the host system (`/proc`, `/etc/`, and `/dev` are mounted). _Agents_ also gather statistics about containers running on each host by mounting the _Docker_ socket (`/var/run/docker.sock`).

All services are written in _Python 3_.

_Skep_ utilises the excellent [Docker SDK for Python](https://docker-py.readthedocs.io/en/stable/index.html) extensively.

The web application uses the equally excellent [Flask](http://flask.pocoo.org/) web framework and [Flask-SocketIO](https://flask-socketio.readthedocs.io/en/latest/).

The front end is read-only. No changes to a swarm can be made via the web application. A best-effort approach to filter sensitive data (e.g. passwords in environment configurations) is implemented using simple heuristics. Regardless, as with all similar systems, it is highly recommended that you run _Skep_ behind a firewall and/or an authentication layer.

## License

[MIT License](LICENSE)

## Contributing

Feel free to make a pull request.
