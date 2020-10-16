#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

printf "Cloning VM {1} to {2}\n"
if ! virt-clone --original {1} --auto-clone --name {2}; then exitFailed; fi

printf "\n\nGenerating metadata\n"
cat <<EOF > /kloudust/metadata/{2}.metadata
VCPUS={3}
RAM={4}
DISK_SIZE={5}
OS_TYPE={7}
OS_VARIANT={8}
INSTALL_DISK="{6}"
ORG="{9}"
PROJECT="{10}"
EOF
if ! virsh dumpxml {2} > /kloudust/metadata/{2}.xml; then exitFailed; fi

printf "Enabling autostart"
if ! virsh autostart {2}; then exitFailed; fi

printf "\n\nClone successfull\n"
exit 0
