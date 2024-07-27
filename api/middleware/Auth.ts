import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";

export default ({
        validation,
    }: {
        validation: (token: string) => Promise<boolean>;
    }) =>
    (app: Elysia) =>
        new Elysia().use(bearer()).guard({
            async beforeHandle({ bearer, set }) {
                if (!bearer) {
                    return ValidateErrorCallback();
                }
                const result = await validation(bearer);
                if (!result) return ValidateErrorCallback();

                function ValidateErrorCallback() {
                    set.status = "Forbidden";
                    set.headers[
                        "WWW-Authenticate"
                    ] = `Bearer realm='sign', error="invalid_request"`;

                    return "Unauthorized";
                }
            },
        });
