const Messages = {
  service: {
    inconsistentImages: 'Tasks are running inconsistent images. Compare task details for more information.',
    unknownDigest: 'Tasks are running image(s) that have not been verified with a remote registry.',
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
