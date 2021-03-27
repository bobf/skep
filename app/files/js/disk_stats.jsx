import React from 'react';
class DiskStats {
  constructor(stats) {
    this.stats = stats;
  }

  name() {
    return this.stats.name;
  }

  partitions() {
    return this.stats.partitions || [];
  }

  label() {
    return this.percent();
  }

  queueLevel() {
    const ops = this.stats.io.ops;

    if (ops < 1) {
      return 'success';
    } else if (ops < 5) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  readsLevel() {
    const reads = this.stats.io.tps.reads;

    if (reads < 100) {
      return 'success';
    } else if (reads < 1000) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  writesLevel() {
    const writes = this.stats.io.tps.writes;

    if (writes < 100) {
      return 'success';
    } else if (writes < 1000) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  level() {
    const ops = this.stats.io.ops;
    const tps = this.stats.io.tps;

    if (ops < 1 && tps.reads < 100 && tps.writes < 100) {
      return 'success';
    } else if (ops < 5 && tps.reads < 1000 && tps.writes < 1000) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  percent() {
    return numeral(100 - this.stats.busy).format('0.00') + '%';
  }
}

export default DiskStats;
