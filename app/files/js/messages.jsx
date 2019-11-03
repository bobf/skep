const Messages = {
  skep: {
    homepage: 'https://github.com/bobf/skep',
  },
  service: {
    networks: (networks) => `Reachable via the following <em>${networks.length}</em> network(s):<br/>${networks.join('<br/>')}`,
    state: {
      inconsistentImages: 'Tasks are running inconsistent images. Compare task details for more information.',
      unknownDigest: 'Tasks are running image(s) that have not been verified with a remote registry.',

      updateStarted: '<em>Update</em> currently in progress.',
      updatePaused: (message) => `<em>Update</em> was paused. Message was: <em>${message}</em>`,
      updateComplete: (updated, digest) => `<em>Update</em> completed successfully <em>${updated}</em>, verified image digests: <em>${digest}</em>`,

      rollbackStarted: '<em>Rollback</em> currently in progress.',
      rollbackPaused: (message) => `<em>Rollback</em> was paused. Message was: <em>${message}</em>`,
      rollbackComplete: (updated, digest) => `<em>Rollback</em> completed successfully <em>${updated}</em>, verified image digests: <em>${digest}</em>`,

      noUpdate: (created) => `Service was <em>created</em> successfully <em>${created}</em>.`,

      unrecognized: (state) => `Unrecognized state: ${state}`,
    },
  },
  chart: {
    noData: 'Metrics currently unavailable. Try again in a few minutes.',
    loading: 'Loading chart data ...',
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
  }
};

export default Messages;
