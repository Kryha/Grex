#!/bin/bash
screen -dmS mongo sudo mongod -quiet
sleep 3
screen -dmS bigchain bigchaindb start --experimental-parallel-validation
sleep 1
screen -dmS tendermint tendermint node --log_level error