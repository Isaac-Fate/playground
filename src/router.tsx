import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { getContext } from './integrations/tanstack-query/root-provider'
import { NotFound } from '@/components/not-found'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: getContext(),

    // Router-level 404: applies to all routes. Override per-route with notFoundComponent.
    // @see https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors
    defaultNotFoundComponent: NotFound,

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
