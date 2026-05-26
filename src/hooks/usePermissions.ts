import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { UserRole } from '../types'
import {
  routePermissions,
  navPermissions,
  dashboardWidgetPermissions,
  hasPermission,
  RouteId,
  WidgetId,
} from '../config/permissions'

/**
 * Centralised permission hook.
 * Provides role-check helpers for routes, sidebar nav, and dashboard widgets.
 */
export function usePermissions() {
  const { user } = useAppStore()
  const role: UserRole | null = user?.role ?? null

  return useMemo(() => {
    const check = (allowed: UserRole[] | '*'): boolean => {
      if (!role) return false
      return hasPermission(role, allowed)
    }

    return {
      /** The current user's role */
      role,

      /** Check if the user has any of the given roles */
      is: (...roles: UserRole[]) => role !== null && roles.includes(role),

      /** Check if the user can access a specific route */
      canAccessRoute: (routeId: RouteId): boolean => {
        const allowed = routePermissions[routeId]
        if (!allowed) return false
        return check(allowed)
      },

      /** Get all nav items the user is allowed to see */
      getVisibleNavItems: () =>
        navPermissions.filter(item => check(item.roles)),

      /** Check if a sidebar nav item should be shown */
      canSeeNavItem: (routeId: RouteId): boolean => {
        const entry = navPermissions.find(n => n.routeId === routeId)
        if (!entry) return false
        return check(entry.roles)
      },

      /** Check if a dashboard widget should be shown */
      canSeeWidget: (widgetId: WidgetId): boolean => {
        const allowed = dashboardWidgetPermissions[widgetId]
        if (!allowed) return false
        return check(allowed)
      },

      /** Get all allowed dashboard widget IDs */
      getVisibleWidgets: (): WidgetId[] =>
        (Object.keys(dashboardWidgetPermissions) as WidgetId[])
          .filter(id => check(dashboardWidgetPermissions[id])),
    }
  }, [role])
}
