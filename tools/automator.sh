#!/bin/bash

# NOT STABLE AT ALL!!! PROOF OF CONCEPT THAT WORKED ONCE OR TWICE!

set -x

nodelist=(
    #rock1 ip
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
    sshpass -p pass ssh root@$i "export PATH=$PATH:/usr/local/bin;source .profile; bash reset.sh"
done

sleep 15
screen -dmS listen bash -c "cd /home/danacristinii/grex/Backend/; node droneListener.js -a 1 -r 5 &>/dev/null"
sleep 5

for i in "${nodelist[@]}"; do
    sshpass -p pass ssh root@$i "cd grex/Backend/; node startDrone.js -t 100 -a 1 -r 5 &>/dev/null"
done