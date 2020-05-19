#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-12

# The node image includes a non-root user with sudo access. Use the 
# "remoteUser" property in devcontainer.json to use it. On Linux, update 
# these values to ensure the container user's UID/GID matches your local values.
# See https://aka.ms/vscode-remote/containers/non-root-user for details.
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# [Optional] Update UID/GID if needed
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then \
        groupmod --gid $USER_GID $USERNAME \
        && usermod --uid $USER_UID --gid $USER_GID $USERNAME \
        && chmod -R $USER_UID:$USER_GID /home/$USERNAME; \
    fi

# *************************************************************
# * Uncomment this section to use RUN instructions to install *
# * any needed dependencies after executing "apt-get update". *
# * See https://docs.docker.com/engine/reference/builder/#run *
# *************************************************************
ENV DEBIAN_FRONTEND=noninteractive
RUN wget https://github.com/cli/cli/releases/download/v0.8.0/gh_0.8.0_linux_amd64.deb
RUN apt install ./gh_*_linux_amd64.deb
RUN rm ./gh_*_linux_amd64.deb
ENV DEBIAN_FRONTEND=dialog

# Uncomment to default to non-root user
# USER $USER_UID
