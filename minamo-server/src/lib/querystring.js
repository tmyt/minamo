import qs from 'qs';

function QueryString(search, names){
  if(search[0] !== '?'){ return {}; }
  const args = qs.parse(search.substring(1));
  if(!Array.isArray(names)) return args;
  const ret = {};
  return names.reduce((prv, cur) => {
    prv[cur] = args[cur];
    return prv;
  }, {});
}

QueryString.stringify = function(args){
  return '?' + qs.stringify(args);
};

QueryString.export = function(router, args){
  const a = QueryString(router.location.search, args);
  return QueryString.stringify(a);
};

export default QueryString;
