import os from "os";

export const getSelfIPs = () => {
    const networkInterfaces = os.networkInterfaces();

    return (
        /** @ts-ignore */
        Object.values(networkInterfaces)
            /** @ts-ignore */
            .reduce((acc, val) => acc.concat(val), [])
            .filter(
                (iface) => iface.family === "IPv4" && iface.internal === false
            )
            .map((iface) => iface.address)
    );
};
