#!/bin/bash

tendermint unsafe_reset_all
bigchaindb -y drop
killall screen