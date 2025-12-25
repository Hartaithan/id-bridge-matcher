import log from "log-update";
import pc from "picocolors";
import { SourceItem } from "../models/source";

interface ProgressParams {
  index: number;
  item: SourceItem;
  skip: boolean;
}

export class Logger {
  private currentIndex: number = 0;
  private currentItem: string = "";
  private startTime: number = 0;
  private totalItems: number = 0;
  private wasSkip: boolean = false;
  private skipCount: number = 0;

  start(total: number): void {
    this.startTime = Date.now();
    this.totalItems = total;
    log.persist(`matching started, total items: ${total}`);
  }

  private skip(): void {
    if (!this.wasSkip) log.done();
    if (!this.wasSkip) this.skipCount = 0;
    this.skipCount++;
    const count = `(${this.skipCount} skipped)`;
    log(`${pc.yellow("[SKIP]")} ${this.currentItem} ${count}`);
    this.wasSkip = true;
  }

  private proceed(): void {
    if (this.wasSkip) log.done();
    log(`${pc.blue("[PROGRESS]")} ${this.currentItem}`);
    this.wasSkip = false;
  }

  progress(params: ProgressParams): void {
    const { index, item, skip } = params;
    this.currentIndex = index;
    const progress = this.getProgress(this.currentIndex + 1);
    this.currentItem = `${this.getLabel(item)} | ${progress}`;
    if (skip) this.skip();
    else this.proceed();
  }

  complete() {
    log(`${pc.green("[MATCH]")} ${this.currentItem}`);
    log.done();
  }

  error(error?: Error | unknown): void {
    let message: string;
    if (!error) message = "no-error";
    else if (error instanceof Error) message = error.message;
    else if (typeof error === "string") message = error;
    else message = String(error);
    log(`${pc.red("[ERROR]")} ${this.currentItem}`, message);
    log.done();
  }

  end(matched: number): void {
    const elapsed = this.getElapsedTime();
    log.persist(pc.green("=".repeat(50)));
    log.persist(pc.green("parsing completed!"));
    log.persist(pc.green(`total time ${elapsed}`));
    log.persist(pc.green(`matched ${matched} out of ${this.totalItems}`));
    log.persist(pc.green(`completion ${this.getProgress(matched)}%`));
    log.persist(pc.green("=".repeat(50)));
  }

  private getLabel(item: SourceItem) {
    let result = `${item.title}`;
    if (item?.region) result += ` | ${item.region}`;
    if (item?.platforms) result += ` | ${item.platforms.join(", ")}`;
    return result;
  }

  private getProgress(value: number) {
    const percentage = ((value / this.totalItems) * 100).toFixed(2);
    return `${value}/${this.totalItems} | ${percentage}%`;
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
