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

  start(total: number): void {
    this.startTime = Date.now();
    this.totalItems = total;
    log.persist(`matching started, total items: ${total}`);
  }

  progress(params: ProgressParams): void {
    const { index, item, skip } = params;
    this.currentIndex = index;
    this.currentItem = `${this.getLabel(item)} | ${this.getProgress()}`;
    if (skip) {
      log(`${pc.yellow("[SKIP]")} ${this.currentItem}`);
      log.done();
    } else {
      log(`${pc.blue("[PROGRESS]")} ${this.currentItem}`);
    }
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
    log.persist(pc.green(`total time: ${elapsed}`));
    log.persist(pc.green(`matched ${matched} out of ${this.totalItems}`));
    log.persist(pc.green("=".repeat(50)));
  }

  private getLabel(item: SourceItem) {
    let result = `${item.title}`;
    if (item?.region) result += ` | ${item.region}`;
    if (item?.platforms) result += ` | ${item.platforms.join(", ")}`;
    return result;
  }

  private getProgress() {
    const current = this.currentIndex + 1;
    const percentage = ((current / this.totalItems) * 100).toFixed(2);
    return `${current}/${this.totalItems} | ${percentage}%`;
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
