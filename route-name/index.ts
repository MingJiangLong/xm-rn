/**
 * Create a route names object.
 *
 * The function takes a tuple of route names, and returns an object where the
 * keys and values are the same as the route names.
 *
 * @example
 * const routes = ["login", "home", "about"] as const;
 * const routeNames = createRouteNames(routes);
 * // routeNames is now { login: "login", home: "home", about: "about" }
 */
export function createRouteNames<T extends readonly string[]>(routes: T) {
    return routes.reduce(
        (total, current) => ({ ...total, [current]: current }),
        {} as { [K in T[number]]: K }
    )
}