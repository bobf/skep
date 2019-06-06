class MemoryStats {
  constructor(stats) {
    this.stats = stats;
    this.stats.unavailable = this.stats.total - this.stats.available;
  }

  label() {
    const available = this.formatNumber(this.stats.available);
    const total = this.formatNumber(this.stats.total);

    return `${available} / ${total}`;
  }

  level() {
    const percent = 100 * (this.stats.used / this.stats.total);

    if (percent < 50) {
      return 'success';
    } else if (percent < 80) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  percent() {
    return numeral(this.unavailable / this.stats.total).format('0.00%');
  }

  formatNumber(number) {
    return numeral(number).format('0.00b');
  }
}

export default MemoryStats;
