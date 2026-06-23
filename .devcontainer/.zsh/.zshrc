autoload -Uz compinit
compinit

source ${ZDOTDIR:-~}/.antidote/antidote.zsh
source "$HOME/.zsh/spaceship/spaceship.zsh"

source "$HOME/.zsh-aliases.zsh"
source "$HOME/.zsh-functions.zsh"

antidote load

toilet -f smblock --filter border ' CSC-UI Devcontainer '
