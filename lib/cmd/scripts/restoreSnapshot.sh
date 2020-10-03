#!/bin/sh


function exitFailed() {
    echo Failed
    exit 1
}

printf "\n\Restoring snapshot {2} to {1}\n"
if ! virsh snapshot-revert {1} {2}; then exitFailed; fi

printf "\n\nVM restored successfully\n"
exit 0
