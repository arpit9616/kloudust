#!/bin/sh


function exitFailed() {
    echo Failed
    exit 1
}

printf "Rebooting the host\n"
reboot

exit 0