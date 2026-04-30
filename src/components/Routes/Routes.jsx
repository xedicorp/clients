// routes.js

// Routes everyone can access (public/global)
export const globalRoutes = [
  "/login",
  "/home",
];

// Routes that require specific permissions
export const permittedRoutes = [
  { permission: "CanCreateBooking", path: "/admin-example" },
  { permission: "CanViewReports", path: "/reports" },
];
