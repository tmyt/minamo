{
  "targets": [{
    "target_name": "interfaces",
    "sources": [ "interfaces.cpp" ],
    "include_dirs": [ "<!(node -e \"require('nan')\")" ]
  }]
}

