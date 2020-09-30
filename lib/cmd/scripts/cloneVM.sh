#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

printf "Cloning VM {1} to {2}\n"
if ! virt-clone --original {1} --auto-clone --name {2}; then exitFailed; fi

printf "Enabling autostart"
if ! virsh autostart {2}; then exitFailed; fi

printf "\n\nClone successfull\n"
exit 0
