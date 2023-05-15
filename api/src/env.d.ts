// 声明全局变量
declare global {
    namespace NodeJS {
        interface Global {
            _fetch: typeof globalThis.fetch;
        }
    }
}
