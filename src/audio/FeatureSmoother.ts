/**
 * Moving-window smoothing for beat-related signals (not for EQ output).
 */

export class EnergyMovingAverage {
  private readonly buf: number[] = [];

  constructor(private readonly maxLen: number) {}

  push(sample: number): void {
    this.buf.push(sample);
    if (this.buf.length > this.maxLen) this.buf.shift();
  }

  average(): number {
    if (this.buf.length === 0) return 0;
    return this.buf.reduce((a, b) => a + b, 0) / this.buf.length;
  }

  clear(): void {
    this.buf.length = 0;
  }
}
