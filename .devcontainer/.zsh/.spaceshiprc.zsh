SPACESHIP_PROMPT_ORDER=(
  time            # Time stampts section
  # user          # Username section
  git             # Git section (git_branch + git_status)
  line_sep        # Line break
  dir             # Current directory section
  # host          # Hostname section
  # hg            # Mercurial section (hg_branch  + hg_status)
  # package       # Package version
  # node          # Node.js section
  # ruby          # Ruby section
  # elixir        # Elixir section
  # xcode         # Xcode section
  # swift         # Swift section
  # golang        # Go section
  # php           # PHP section
  # rust          # Rust section
  # haskell       # Haskell Stack section
  # julia         # Julia section
  # docker        # Docker section
  # aws           # Amazon Web Services section
  # venv          # virtualenv section
  # conda         # conda virtualenv section
  # pyenv         # Pyenv section
  # dotnet        # .NET section
  # ember         # Ember.js section
  # kubecontext   # Kubectl context section
  exec_time       # Execution time
  line_sep        # Line break
  # battery       # Battery level and status
  # vi_mode       # Vi-mode indicator
  # jobs          # Background jobs indicator
  # exit_code     # Exit code section
  char            # Prompt character
)

# SPACESHIP_CHAR_SYMBOL='❯ '
SPACESHIP_CHAR_SYMBOL='🚀 '
SPACESHIP_CHAR_SYMBOL_ROOT='💀 '
SPACESHIP_DIR_PREFIX=''
SPACESHIP_DIR_TRUNC=0
SPACESHIP_DIR_TRUNC_REPO=false
SPACESHIP_GIT_BRANCH_PREFIX=''
SPACESHIP_GIT_PREFIX=''
SPACESHIP_GIT_STATUS_COLOR='#585858'
SPACESHIP_NODE_SHOW=false
SPACESHIP_PACKAGE_SHOW=false
SPACESHIP_PHP_SHOW=false
SPACESHIP_TIME_FORMAT='%*'
SPACESHIP_TIME_PREFIX=''
SPACESHIP_TIME_SHOW=true
SPACESHIP_TIME_SUFFIX=' '

SPACESHIP_GIT_STATUS_PREFIX=' '
SPACESHIP_GIT_STATUS_SUFFIX=''
SPACESHIP_GIT_STATUS_UNTRACKED='UT '
SPACESHIP_GIT_STATUS_ADDED='A '
SPACESHIP_GIT_STATUS_MODIFIED='M '
SPACESHIP_GIT_STATUS_RENAMED='R '
SPACESHIP_GIT_STATUS_DELETED='D '
SPACESHIP_GIT_STATUS_STASHED='S '
SPACESHIP_GIT_STATUS_UNMERGED='UM '
SPACESHIP_GIT_STATUS_DIVERGE='D '
