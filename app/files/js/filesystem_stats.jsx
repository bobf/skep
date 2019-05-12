class FilesystemStats {
  constructor(stats) {
    this.stats = stats;
  }

  path() {
    return this.stats.path;
  }

  label() {
    return this.percent();
  }

  level() {
    const percent = 100 * (this.stats.free / this.stats.total);

    if (percent < 60) {
      return 'success';
    } else if (percent < 80) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  percent() {
    return numeral(this.stats.free / this.stats.total).format('0.00%');
  }
}

export default FilesystemStats;
