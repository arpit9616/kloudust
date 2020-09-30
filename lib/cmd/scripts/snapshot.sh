#!/bin/sh


function exitFailed() {
    echo Failed
    exit 1
}


printf "\n\Snapshotting {1} to image named {2}\n"
if ! virsh dominfo {1} | grep "State" | grep "running"; then
    if ! virsh snapshot-create-as --domain {1} {2} \
        --diskspec vda,file=/kloudust/snapshots/{1}.{2}.disk.img,snapshot=external \
        --disk-only --atomic; then exitFailed; fi
else
    if ! virsh snapshot-create-as --domain {1} {2} \
        --diskspec vda,file=/kloudust/snapshots/{1}.{2}.disk.img,snapshot=external \
        --memspec file=/kloudust/snapshots/{1}.{2}.mem.img,snapshot=external --atomic; then exitFailed; fi
fi


printf "\n\nSnapshot successful\n"
exit 0
