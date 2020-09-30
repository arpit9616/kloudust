#!/bin/sh


function exitFailed() {
    echo Failed
    exit 1
}

printf "Renaming {1} to {2}\n"
if ! virsh domrename {1} {2}; then exitFailed; fi

printf "\n\nRename successfull\n"
exit 0
