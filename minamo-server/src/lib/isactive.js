function isActive(router, path){
  return router.route.location.pathname === path;
}

export default isActive;
