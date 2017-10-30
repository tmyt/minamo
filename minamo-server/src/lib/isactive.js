function isActive(router, path, isExact){
  return router.route.location.pathname === path;
}

export default isActive;
