// 定义全局变量 Deno, 拥有 test 函数
declare const Deno: Deno;
interface Deno {
    test(name: string, fn: () => Promise<void>): void;
}
