#!/bin/sh


function exitFailed() {
    echo Failed
    exit 1
}


printf "\n\Snapshotting {1} to image named {2}\n"
if ! virsh dominfo {1} | grep "State" | grep "running"; then
    if ! virsh snapshot-create-as --domain {1} {2} \
        --diskspec vda,file=/kloudust/temp/{1}.{2}.disk.qcow2,snapshot=external \
        --disk-only --atomic; then exitFailed; fi
else
    if ! virsh snapshot-create-as --domain {1} {2} \
        --diskspec vda,file=/kloudust/temp/{1}.{2}.disk.qcow2,snapshot=external \
        --memspec file=/kloudust/snapshots/{1}.{2}.mem.img,snapshot=external --atomic; then exitFailed; fi
fi

printf "\n\Adding additional snapshot metadata\n"
echo `date +%s` > /kloudust/snapshots/{1}.{2}.timestamp

printf "\n\nMaking snapshot independent\n"
if ! virsh snapshot-delete {1} {2} --metadata; then exitFailed; fi
if ! virsh blockpull --domain {1} --path /kloudust/temp/{1}.{2}.disk.qcow2 --verbose --wait; then exitFailed; fi
if ! qemu-img convert -f qcow2 -O qcow2 /kloudust/temp/{1}.{2}.disk.qcow2 /kloudust/temp/{1}.{2}.fat.disk.qcow2 --force-share; then exitFailed; fi
if ! virt-sparsify /kloudust/temp/temp/{1}.{2}.fat.disk.qcow2 /kloudust/snapshots/{1}.{2}.disk.qcow2; then exitFailed; fi


printf "\n\nSnapshot successful\n"
exit 0
