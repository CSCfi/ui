# Lightweight sandbox image for Claude Code.
# For a heavier reference setup (node base, zsh, in-container firewall), see
# Anthropic's devcontainer:
#   https://github.com/anthropics/claude-code/blob/main/.devcontainer/Dockerfile
FROM node:24-slim

# Dependencies and tools CC likes to use, like jq and ripgrep.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    bash \
    git \
    ripgrep \
    jq \
    zsh \
    python3 \
    make \
    less \
    vim \
    nano \
    procps \
    unzip \
    toilet \
    figlet \
    && rm -rf /var/lib/apt/lists/*

ARG USERNAME=claudeuser

ENV DEVCONTAINER=true

# Install Claude Code via the official native installer as a non-root user
ARG HOST_UID=1000
ARG HOST_GID=1000
RUN userdel node \
 && getent group ${HOST_GID} || groupadd -g ${HOST_GID} ${USERNAME} \
 && useradd -ms /bin/bash -u ${HOST_UID} -g ${HOST_GID} ${USERNAME}

RUN mkdir -p /workspace/node_modules && chown -R ${USERNAME}:${USERNAME} /workspace/node_modules

# Chromium + its OS dependencies for headless Playwright runs (component e2e /
# visual checks). Done here while root and with unrestricted network: at runtime
# claudeuser lacks sudo and the firewall blocks the browser CDN, so the browser
# must be baked into the image. Installed to a system path (not node_modules,
# which is a named volume that would shadow it) and made world-readable so
# claudeuser can launch it. Pinned to the `playwright` version in the repo
# lockfile so the client API and the baked browser agree.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx -y playwright@1.60.0 install --with-deps chromium \
 && chmod -R a+rX /ms-playwright \
 && rm -rf /var/lib/apt/lists/*

USER ${USERNAME}

RUN mkdir -p /home/${USERNAME}/.claude && \
    chown -R ${USERNAME} /home/${USERNAME}/.claude

RUN mkdir -p /home/claudeuser/.npm-global && \
    npm config set prefix '/home/claudeuser/.npm-global' && \
    npm install -g @anthropic-ai/claude-code

ENV PATH=/home/claudeuser/.npm-global/bin:$PATH

WORKDIR /home/${USERNAME}

ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/zsh

RUN git clone --depth=1 https://github.com/mattmc3/antidote.git /home/${USERNAME}/.antidote

RUN mkdir -p "/home/${USERNAME}/.zsh" \
 && git clone --depth=1 https://github.com/spaceship-prompt/spaceship-prompt.git /home/${USERNAME}/.zsh/spaceship

COPY /.zsh /home/${USERNAME}/

# RUN curl -fsSL https://claude.ai/install.sh | bash

# Uncomment this line if you want a claude entrypoint, but
# normally we will run this with a lauching script
# CMD ["claude"]
