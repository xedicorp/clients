import { globalRoutes, permittedRoutes } from "../Routes/Routes";

export const getAccessibleRoutes = (userPermissions = []) => {
  // Start with public routes
  let accessibleRoutes = [...globalRoutes];

  // Add routes where user has permission
  permittedRoutes.forEach(route => {
    if (userPermissions.includes(route.permission)) {
      accessibleRoutes.push(route.path);
    }
  });

  return accessibleRoutes;
};
