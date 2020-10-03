#!/bin/sh


function exitFailed() {
    echo Failed
    exit 1
}

printf "\n\Deleting snapshot {2} for {1}\n"
if ! rm -rf /kloudust/snapshots/{1}.{2}.disk.qcow2; then exitFailed; fi
if ! rm -rf /kloudust/snapshots/{1}.{2}.mem.img; then exitFailed; fi

printf "\n\nVM snapshot deleted successfully\n"
exit 0
