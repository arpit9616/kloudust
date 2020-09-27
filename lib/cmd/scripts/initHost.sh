#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

printf "Updating the system\n"
if ! sudo yum -y update; then exitFailed; fi

printf "\n\nSecuring the system against SSH attacks\n"
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

printf "\n\nSystem initialization finished successfully\n"
exit 0