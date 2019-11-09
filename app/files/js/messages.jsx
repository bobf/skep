const Messages = {
  pluralize: (word, count) => `${word}${Math.round(count) !== 1 ? "s" : ""}`,
  skep: {
    code: 'https://github.com/bobf/skep',
    homepage: 'https://skepdocker.github.io',
    connectionError: (
      <span>{'Skep has stopped receiving updates. Try '}<a onClick={() => location.reload()}>{'refreshing the page'}</a>{' to reconnect.'}</span>
    ),
    connectionLive: (ago) => `Last update: <em>${Math.round(ago)} ${Messages.pluralize('second', ago)} ago</em>`,
  },

  overview: {
    nodes: {
      inconsistentVersions: (count) => `<em>${count}</em> unique Docker Engine versions detected.`,
      consistentVersions: 'All nodes are running the same Docker Engine version.',
      noQuorum: '<em>Even</em> number of nodes detected. <em>Quorum</em> cannot be attained.',
    },
    containers: {
      valid: (count) => `<em>${count}</em> containers reported by both <em>Swarm</em> and <em>Nodes</em>. ✓`,
      invalid: (count, swarmCount) => `<em>${swarmCount}</em> containers reported by <em>Swarm</em> does not match <em>${count}</em> containers reported by <em>Nodes</em>. ✗`,
    },
    networks: {
      unattached: (count) => `Detected <em>${count}</em> networks not attached to any services.`,
    },
  },

  chart: {
    noData: 'Metrics currently unavailable. Try again in a few minutes.',
    loading: 'Loading chart data ...',
  },

  node: {
    tooltip : {
      lastUpdated: when => `Last updated <em>${Math.round(when)} ${Messages.pluralize('second', when)} ago</em>`,
      hostname: hostname => `Hostname: <em>${hostname}</em>`,
      version:  version => `Docker Engine Version: <em>${version}</em>`,
      containers: containers => `Active Containers: <em>${containers.length}</em>`,
    },
    stats: {
      tooltipRow: (label, value) => `<span class='node-stats-tooltip-row'><em>${label}</em>: ${value}</span>`,
      loadAverage: {
        oneMinute: '<em>1 minute</em> load average',
        tenMinutes: '<em>10 minutes</em> load average',
        fifteenMinutes: '<em>15 minutes</em> load average',
      },
    },
  },

  service: {
    networks: (networks) => `Reachable via the following <em>${networks.length}</em> ${Messages.pluralize('network', networks.length)}:<br/>${networks.join('<br/>')}`,
    replicas: {
      tooltip: (replicaCount, runningCount, statusSymbol) => `<em>${runningCount} / ${replicaCount}</em> ${Messages.pluralize('replica', runningCount)} running <em>${statusSymbol}</em>`,
      errors: (errors) => `<span class='text-danger'><em>${errors.length}</em> ${Messages.pluralize('error', errors.length)} reported by tasks in the last <em>60</em> seconds</span>`,
    },
    state: {
      inconsistentImages: 'Tasks are running inconsistent images. Compare task details for more information.',
      unknownDigest: 'Tasks are running images that have not been verified with a remote registry.',

      updateStarted: '<em>Update</em> currently in progress.',
      updatePaused: (message) => `<em>Update</em> was paused. Message was: <em>${message}</em>`,
      updateComplete: (updated, digest) => `Service was <em>updated</em> successfully <em>${updated}</em>, verified image digests: <em>${digest}</em>`,

      rollbackStarted: '<em>Rollback</em> currently in progress.',
      rollbackPaused: (message) => `<em>Rollback</em> was paused. Message was: <em>${message}</em>`,
      rollbackComplete: (updated, digest) => `<em>Rollback</em> completed successfully <em>${updated}</em>, verified image digests: <em>${digest}</em>`,

      noUpdate: (created) => `Service was <em>created</em> successfully <em>${created}</em>.`,

      unrecognized: (state) => `Unrecognized state: ${state}`,
    },
  },

  task: {
    error: (error) => `<span class='error-message'>${error.message}</span>&nbsp;<span class='error-tstamp'><em>(${error.since} ${Messages.pluralize('second', error.since)} ago)</em></span>`,
  },
};

export default Messages;
