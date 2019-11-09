import Messages from './messages';

class MemoryStats {
  constructor(stats) {
    this.stats = stats;
    this.stats.unavailable = this.stats.total - this.stats.available;
  }

  label() {
    return `RAM: ${this.percent()}`;
  }

  tooltip() {
    const row = (label, value) => Messages.node.stats.tooltipRow(label, this.formatNumber(value));
    const labels = [
      row('Available', this.stats.available),
      row('Cache', this.stats.cached),
      row('Active', this.stats.active),
      row('Free', this.stats.free),
      row('Swap (total)', this.stats.swap_total),
      row('Swap (free)', this.stats.swap_free),
    ];

    return `<div class="node-stats-tooltip"><h4>RAM</h4>${labels.join('<br/>')}</div>`;
  }

  level() {
    const percent = 100 * (this.stats.unavailable / this.stats.total);

    if (percent < 50) {
      return 'success';
    } else if (percent < 80) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  percent() {
    return numeral(this.stats.unavailable / this.stats.total).format('0.00%');
  }

  formatNumber(number) {
    return numeral(number).format('0.00b');
  }
}

export default MemoryStats;
