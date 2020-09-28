#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

printf "Showing VM list\n"
if ! virsh {1}; then exitFailed; fi

printf "\n\nSuccess\n"
exit 0