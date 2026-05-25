function mkcd() { mkdir -p "$1" && cd "$1"; }

function pup() { pnpm $1 update -i -L; }
