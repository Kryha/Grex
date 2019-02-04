#!/bin/bash
set -x
if [ "$#" -ne 4 ]; then
    echo "Illegal number of parameters"
    echo "drones_max drones_min drones_step number_of_rounds"
exit 1
fi

for j in `seq $1 -$3 $2`; do
for i in `seq 1 $4`; do
trap continue SIGINT
trap exit SIGQUIT
echo
echo "round $i out of $4 for $j drones"
echo
ssh -i /home/dan/azure dan@10.0.0.4 'source .profile; bash reset.sh'
sleep 5
screen -dmS listen bash -c "cd /home/dan/grex/Backend/; node droneListener.js -a $j -r 5 &>/dev/null"
sleep 3
cd /home/dan/grex/Backend; timeout --foreground 800 node startDrone.js -a $j -t 100 -r 5 &> /dev/null
sleep 5
killall screen
done
done

# from 9 to 5

for j in `seq 9 -1 5`; do
for i in `seq 1 $4`; do
trap continue SIGINT
trap exit SIGQUIT
echo
echo "round $i out of $4 for $j drones"
echo
ssh -i /home/dan/azure dan@10.0.0.4 'source .profile; bash reset.sh'
sleep 5
screen -dmS listen bash -c "cd /home/dan/grex/Backend/; node droneListener.js -a $j -r 5 &>/dev/null"
sleep 3
cd /home/dan/grex/Backend; timeout --foreground 1200 node startDrone.js -a $j -t 100 -r 5 &> /dev/null
sleep 5
killall screen
done
done