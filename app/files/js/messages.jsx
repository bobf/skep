const Messages = {
  service: {
    state: {
      inconsistentImages: 'Tasks are running inconsistent images. Compare task details for more information.',
      unknownDigest: 'Tasks are running image(s) that have not been verified with a remote registry.',

      updateStarted: '<em>Update</em> currently in progress.',
      updatePaused: (message) => `<em>Update</em> was paused. Message was: <em>${message}</em>`,
      updateComplete: (updated, digest) => `<em>Update</em> completed successfully <em>${updated}</em>, verified image digests: <em>${digest}</em>`,

      rollbackStarted: '<em>Rollback</em> currently in progress.',
      rollbackPaused: (message) => `<em>Rollback</em> was paused. Message was: <em>${message}</em>`,
      rollbackComplete: (updated, digest) => `<em>Rollback</em> completed successfully <em>${updated}</em>, verified image digests: <em>${digest}</em>`,

      unrecognized: (state) => `Unrecognized state: ${state}`,
    }
  },
  chart: {
    noData: 'No data currently available for this entity.'
  },
  overview: {
    nodes: {
      inconsistentVersions: (count) => `<em>${count}</em> unique Docker Engine versions detected.`,
      consistentVersions: 'All nodes are running the same Docker Engine version.',
      noQuorum: '<em>Even</em> number of nodes detected. <em>Quorum</em> cannot be attained.'
    }
  }
};

export default Messages;
