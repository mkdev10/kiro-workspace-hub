/**
 * デバウンスされた関数を作成する
 * 最後の呼び出しから指定ミリ秒後に実行される
 */
export class Debouncer {
    private timer: NodeJS.Timeout | undefined;
    private pendingPromise: Promise<void> | undefined;
    private pendingResolve: (() => void) | undefined;

    constructor(private readonly delay: number = 300) { }

    /**
     * デバウンスされたコールバックをスケジュールする
     * 既存のタイマーがあればリセットされる
     */
    schedule(callback: () => Promise<void>): Promise<void> {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        if (!this.pendingPromise) {
            this.pendingPromise = new Promise<void>((resolve) => {
                this.pendingResolve = resolve;
            });
        }

        this.timer = setTimeout(async () => {
            this.timer = undefined;
            try {
                await callback();
            } finally {
                const resolve = this.pendingResolve;
                this.pendingPromise = undefined;
                this.pendingResolve = undefined;
                resolve?.();
            }
        }, this.delay);

        return this.pendingPromise;
    }

    /**
     * 保留中の書き込みを即座に実行する（deactivate時に使用）
     */
    async flush(callback: () => Promise<void>): Promise<void> {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
            await callback();
            const resolve = this.pendingResolve;
            this.pendingPromise = undefined;
            this.pendingResolve = undefined;
            resolve?.();
        }
    }

    /** 保留中の書き込みがあるか */
    get hasPending(): boolean {
        return this.timer !== undefined;
    }

    dispose(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
}
