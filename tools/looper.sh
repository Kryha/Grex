#!/bin/bash

# EXPERIMENTAL


nodelist=(
    192.168.169.94
    192.168.169.52
    192.168.169.45
    192.168.169.47
    192.168.169.46
    192.168.169.50
    192.168.169.49
    192.168.169.48
    192.168.169.51
   )
for i in "${nodelist[@]}"; do
    sshpass -p 'PASS' ssh root@$i "export PATH=$PATH:/usr/local/bin;source .profile;  $@"
done
