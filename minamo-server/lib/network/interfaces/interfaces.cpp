#include<sys/types.h>
#include<sys/socket.h>
#include<ifaddrs.h>
#include<nan.h>

#include<array>

#define MAKEWORD(x, y) ((((unsigned short)(x)) << 8) | ((unsigned short)(y)))
#define inx_addr(x, in) (((struct sockaddr_ ## in *)x)->s ## in ## _addr)
#define in_addr(x) inx_addr(x, in)
#define in6_addr(x) inx_addr(x, in6)

#define IF_DEV (0)
#define IF_ADDRESS (1)
#define IF_FAMILY (2)

std::array<unsigned short, 8> v6addr(const struct in6_addr& addr){
  std::array<unsigned short, 8> ret;
  for(auto i = 0; i < 8; ++i){
    ret[i] = MAKEWORD(addr.s6_addr[i * 2], addr.s6_addr[i * 2 + 1]);
  }
  return ret;
}

template<class T, long unsigned int N>
v8::Local<v8::Array> toNanArray(const std::array<T, N>& src){
  auto a = Nan::New<v8::Array>();
  for(auto i = 0u; i < N; ++i){
    Nan::Set(a, i, Nan::New(src[i]));
  }
  return a;
}

template<class T>
v8::Local<v8::Array> toNanArray(const T& a, const T& b){
  auto r = Nan::New<v8::Array>();
  Nan::Set(r, 0, a);
  Nan::Set(r, 1, b);
  return r;
}

NAN_METHOD(all){
  struct ifaddrs *ifaddr;
  if(getifaddrs(&ifaddr) == -1){
    return;
  }
  auto result = Nan::New<v8::Array>();
  for(auto ifa = ifaddr; ifa; ifa = ifa->ifa_next){
    auto family = ifa->ifa_addr->sa_family;
    if(family != AF_INET && family != AF_INET6){
      continue;
    }
    auto iface = Nan::New<v8::Array>();
    Nan::Set(iface, IF_DEV, Nan::New(ifa->ifa_name).ToLocalChecked());
    if(family == AF_INET){
      // ipv4
      auto addr = Nan::New(in_addr(ifa->ifa_addr).s_addr);
      auto mask = Nan::New(in_addr(ifa->ifa_netmask).s_addr);
      Nan::Set(iface, IF_ADDRESS, toNanArray(addr, mask));
    }else{
      // ipv6
      auto addr = toNanArray(v6addr(in6_addr(ifa->ifa_addr)));
      auto mask = toNanArray(v6addr(in6_addr(ifa->ifa_netmask)));
      Nan::Set(iface, IF_ADDRESS, toNanArray(addr, mask));
    }
    Nan::Set(iface, IF_FAMILY, Nan::New(family));
    Nan::Set(result, result->Length(), iface);
  }
  freeifaddrs(ifaddr);
  info.GetReturnValue().Set(result);
}

NAN_MODULE_INIT(init){
  NAN_EXPORT(target, all);
}

NODE_MODULE(interfaces, init);

