#!/bin/bash

ENV_NAME="galago-core"

build_env() {
    echo "Creating conda environment '$ENV_NAME'..."
    conda create --name $ENV_NAME python=3.9.12 nodejs=16.13.1 -y
    echo "Conda environment '$ENV_NAME' created."
}

activate_env() {
    echo "Activating environment '$ENV_NAME'..."
    conda activate $ENV_NAME
}

install_packages() {
    echo "Installing packages in '$ENV_NAME'..."
    activate_env
    conda install -n $ENV_NAME -c conda-forge -c anaconda -c bioconda -c defaults --file requirements.txt -y
    echo "Packages installed."
}

list_packages() {
    echo "Listing installed packages in '$ENV_NAME'..."
    conda list --name $ENV_NAME
}
