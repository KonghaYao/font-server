import os from "os";
import path from "path";
export const createTempPath = (...args: string[]) => {
    return path.join(os.tmpdir(), ...args);
};
