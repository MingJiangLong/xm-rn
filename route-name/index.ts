type RouteMap<T extends readonly string[]> = {
    readonly [K in T[number]]: K;
};

export function createRouteNames<T extends string>(routes: readonly T[]): RouteMap<readonly T[]> {
    return Object.fromEntries(routes.map(r => [r, r])) as any;
}


// let a = createRouteNames(["login", "home", "about"]);

