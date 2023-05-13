import Router from "@koa/router";
const FontsRouter = new Router();

FontsRouter.post("/fonts", (ctx) => {
    console.log((ctx.request as any).files);
    return;
});

export { FontsRouter };
