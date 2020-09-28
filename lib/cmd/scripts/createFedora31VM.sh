#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

printf "Creating Fedora 31 VM\n"
if ! virt-install --name {1} --metadata title="{2}" \
    --vcpus {3} --ram {4} \
    --disk path=/kloudust/disks/{1}.img,size={5} \
    --os-type linux --os-variant fedora31 \
    --network bridge=virbr0 \
    --graphics vnc,listen=0.0.0.0 --noautoconsole \
    {6} \
    --virt-type kvm; then exitFailed; fi

printf "\n\nConnect via VNC to one of the following\n"
PORT=`virsh vncdisplay {1} | cut -c 2-`;echo `ip route get 8.8.8.8 | head -1 | cut -d' ' -f7`:`expr 5900 + $PORT`
echo `hostname`:`expr 5900 + $PORT`

printf "\n\nVM created successfully\n"
exit 0