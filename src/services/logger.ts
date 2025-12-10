interface ProgressParams {
  index: number;
  label: string;
  skip: boolean;
}

export class Logger {
  private startTime: number = 0;
  private totalItems: number = 0;

  start(total: number): void {
    this.startTime = Date.now();
    this.totalItems = total;
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

  complete(matched: number): void {
    const elapsed = this.getElapsedTime();
    console.info("=".repeat(50));
    console.info("parsing completed!");
    console.info(`total time: ${elapsed}`);
    console.info(`matched ${matched} out of ${this.totalItems}`);
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
