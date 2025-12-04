import Matched from "./matched";

interface ProgressParams {
  index: number;
  label: string;
  skip: boolean;
}

interface Counts {
  matched: number;
  unmatched: number;
}

export class Logger {
  private startTime: number = 0;
  private totalItems: number = 0;
  private before: Counts = { matched: 0, unmatched: 0 };
  private after: Counts = { matched: 0, unmatched: 0 };

  start(total: number, matched: Matched): void {
    this.startTime = Date.now();
    this.totalItems = total;
    this.before = {
      matched: matched.count("matched"),
      unmatched: matched.count("unmatched"),
    };
    console.info(`parsing started, total items: ${total}`);
  }

  progress(params: ProgressParams): void {
    const { index, label, skip } = params;
    const current = index + 1;
    const percentage = ((current / this.totalItems) * 100).toFixed(2);
    console.info(
      `${skip ? "[SKIP] " : ""}${label} | ${current}/${this.totalItems} | ${percentage}%`,
    );
  }

  error(label: string, error?: Error | unknown): void {
    let message: string;
    if (!error) message = "no-error";
    else if (error instanceof Error) message = error.message;
    else if (typeof error === "string") message = error;
    else message = String(error);
    console.error(`[ERROR] ${label}`, message);
  }

  complete(matched: Matched): void {
    this.after = {
      matched: matched.count("matched"),
      unmatched: matched.count("unmatched"),
    };
    const elapsed = this.getElapsedTime();
    console.info("=".repeat(50));
    console.info("parsing completed!");
    console.info(`total time: ${elapsed}`);
    console.info(`matched ${this.after.matched} out of ${this.totalItems}`);
    console.info(`+${this.after.matched - this.before.matched} matched`);
    console.info(`+${this.after.unmatched - this.before.unmatched} unmatched`);
    console.info("=".repeat(50));
  }

  private getElapsedTime(): string {
    const elapsed = Date.now() - this.startTime;
    const total = Math.floor(elapsed / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    if (seconds > 0) return `${seconds}s`;
    return `${elapsed}ms`;
  }
}
