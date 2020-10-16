#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

if virsh list --all | grep {1}; then
    printf "VM already exists. Use a different name.\n"
    exitFailed
fi

printf "Creating VM {1}\n"
if [ "{7}" == "windows" ]; then 
    WIN_DISK_ARGS="--disk /kloudust/drivers/virtio-win_amd64.vfd,device=floppy"
else
    WIN_DISK_ARGS=""
fi;
if ! virt-install --name {1} --metadata title="{2}" --metadata description="{1}-{2}-{9}-{10}" \
    --vcpus {3} --ram {4} \
    --disk path=/kloudust/disks/{1}.qcow2,size={5},format=qcow2 $WIN_DISK_ARGS \
    --os-type {7} --os-variant {8} \
    --network network=default \
    --controller type=scsi,model=virtio-scsi \
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
OS_TYPE={7}
OS_VARIANT={8}
INSTALL_DISK="{6}"
ORG="{9}"
PROJECT="{10}"
EOF
if ! virsh dumpxml {1} > /kloudust/metadata/{1}.xml; then exitFailed; fi


printf "\n\nConnect via VNC to one of the following\n"
PORT=`virsh vncdisplay {1} | cut -c 2-`;echo `ip route get 8.8.8.8 | head -1 | cut -d' ' -f7`:`expr 5900 + $PORT`
echo `hostname`:`expr 5900 + $PORT`

printf "\n\nVM created successfully\n"
exit 0