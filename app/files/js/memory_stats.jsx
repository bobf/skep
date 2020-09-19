import Messages from './messages';

class MemoryStats {
  constructor(stats) {
    this.stats = stats;
    this.stats.unavailable = this.stats.total - this.stats.available;
  }

  label() {
    return `${this.formatNumber(this.stats.unavailable)} / ${this.formatNumber(this.stats.total)}`;
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

  level(usage, total) {
    const percent = 100 * ((usage || this.stats.unavailable) / (total || this.stats.total));

    if (percent < 50) {
      return 'success';
    } else if (percent < 80) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  swapUsage() {
    return this.formatNumber(Math.max(this.stats.swap_total - this.stats.swap_free, 0));
  }

  swapTotal() {
    return this.formatNumber(this.stats.swap_total);
  }

  swapPercent() {
    return numeral(this.swapUsage() / this.swapTotal()).format('0.00%');
  }

  swapLevel() {
    return this.level((this.stats.swap_total - this.stats.swap_free), this.stats.swap_total);
  }

  swapTooltip() {
    return (
      `<b>Swap</b><br/>
       <em class='swap free'>${this.swapUsage()}</em>
       <span class='syntax'>/</span>
       <em class='swap total'>${this.swapTotal()}</em>
       <span class='syntax'>(</span><span class='text-${this.swapLevel()}'>${this.swapPercent()}</span><span class='syntax'>)</span>`
    );
  }
  percent() {
    return numeral(this.stats.unavailable / this.stats.total).format('0.00%');
  }

  formatNumber(number) {
    return numeral(number).format('0.00b');
  }
}

export default MemoryStats;
