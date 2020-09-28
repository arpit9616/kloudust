#!/bin/sh

function exitFailed() {
    echo Failed
    exit 1
}

printf "Adding image to catalog\n"
if ! curl -L {1} > /kloudust/catalog/{2}; then exitFailed; fi
if ! ls -al /kloudust/catalog/{2}; then exitFailed; fi
if ! chgrp qemu /kloudust/catalog/{2}; then exitFailed; fi

printf "\n\nImage added successfully\n"
exit 0