#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

if virsh list --all | grep {1}; then
    printf "VM already exists. Use a different name.\n"
    exitFailed
fi

printf "Creating CentOS 8 VM\n"
if ! virt-install --name {1} --metadata title="{2}" \
    --vcpus {3} --ram {4} \
    --disk path=/kloudust/disks/{1}.qcow2,size={5},format=qcow2 \
    --os-type linux --os-variant fedora31 \
    --network network=default \
    --graphics vnc,listen=0.0.0.0 --noautoconsole \
    {6} \
    --virt-type kvm; then exitFailed; fi

printf "\n\nEnabling autostart\n"
if ! virsh autostart {1}; then exitFailed; fi

printf "\n\nGenerating metadata\n"
cat <<EOF > /kloudust/metadata/{1}.metadata
VCPUS={3}
RAM={4}
DISK_SIZE={5}
OS_TYPE=linux
OS_VARIANT=fedora31
INSTALL_DISK="{6}"
EOF
if ! virsh dumpxml {1} > /kloudust/metadata/{1}.xml; then exitFailed; fi


printf "\n\nConnect via VNC to one of the following\n"
PORT=`virsh vncdisplay {1} | cut -c 2-`;echo `ip route get 8.8.8.8 | head -1 | cut -d' ' -f7`:`expr 5900 + $PORT`
echo `hostname`:`expr 5900 + $PORT`

printf "\n\nVM created successfully\n"
exit 0