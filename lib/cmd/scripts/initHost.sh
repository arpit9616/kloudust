#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

printf "Updating the system\n"
if ! sudo yum -y update; then exitFailed; fi

printf "\n\nSecuring the system against SSH attacks\n"
sudo yum -y install epel-release
if ! sudo yum -y install fail2ban; then exitFailed; fi
cat <<EOF > /etc/fail2ban/jail.local
[DEFAULT]
# Ban hosts for one hour:
bantime = 3600

# Override /etc/fail2ban/jail.d/00-firewalld.conf:
banaction = iptables-multiport

[sshd]
enabled = true
EOF
if ! sudo systemctl enable --now fail2ban; then exitFailed; fi


printf "\n\nEnabling hypervisor\n"
if ! sudo yum -y install @virt virt-top libguestfs-tools virt-install; then exitFailed; fi
if ! sudo systemctl enable --now libvirtd; then exitFailed; fi
if ! lsmod | grep -i kvm; then exitFailed; fi


printf "\n\nCreating Kloudust Structures\n"
if ! mkdir -p /kloudust/catalog/; then exitFailed; fi
if ! mkdir -p /kloudust/drivers/; then exitFailed; fi
if ! mkdir -p /kloudust/disks/; then exitFailed; fi
if ! chgrp -R qemu /kloudust/; then exitFailed; fi


printf "\n\nDownloading additional drivers\n"
curl -L https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win_amd64.vfd > /kloudust/drivers/virtio-win_amd64.vfd


printf "\n\nSystem initialization finished successfully\n"
exit 0