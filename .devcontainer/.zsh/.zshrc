HISTFILE=$HOME/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt SHARE_HISTORY
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE

autoload -Uz compinit
compinit

source ${ZDOTDIR:-~}/.antidote/antidote.zsh
source "$HOME/.zsh/spaceship/spaceship.zsh"

source "$HOME/.zsh-aliases.zsh"
source "$HOME/.zsh-functions.zsh"

antidote load

toilet -f smblock --filter border ' CSC-UI Devcontainer '
