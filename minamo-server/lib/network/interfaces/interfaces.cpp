#include<sys/types.h>
#include<sys/socket.h>
#include<ifaddrs.h>
#include<nan.h>

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
    Nan::Set(iface, 0, Nan::New(ifa->ifa_name).ToLocalChecked());
    if(family == AF_INET){
      // ipv4
      auto addr = ((struct sockaddr_in*)ifa->ifa_addr)->sin_addr;
      Nan::Set(iface, 1, Nan::New(addr.s_addr));
    }else{
      // ipv6
      auto addr = ((struct sockaddr_in6*)ifa->ifa_addr)->sin6_addr;
      for(auto i = 0; i < 16; ++i){
        Nan::Set(iface, i + 1, Nan::New((unsigned int)addr.s6_addr[i]));
      }
    }
    Nan::Set(result, result->Length(), iface);
  }
  freeifaddrs(ifaddr);
  info.GetReturnValue().Set(result);
}

NAN_MODULE_INIT(init){
  NAN_EXPORT(target, all);
}

NODE_MODULE(interfaces, init);

