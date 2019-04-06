function isActive(router, path){
  return router.location.pathname === path;
}

export default isActive;
