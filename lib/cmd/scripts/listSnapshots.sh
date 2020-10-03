#!/bin/sh


function exitFailed() {
    echo Failed
    exit 1
}

printf "\n\Snapshots for {1}\n"
ls /kloudust/snapshots/|cat|grep {1}

printf "\n\nSnapshots listed successfully\n"
exit 0
