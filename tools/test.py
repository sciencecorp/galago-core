import os
from setuptools import setup, find_namespace_packages
import os
import subprocess
from setuptools.command.build_py import build_py as _build_py
from os.path import join, dirname, realpath

def run():
    proto_src = os.path.join(dirname(dirname(os.path.realpath(__file__))), "interfaces")
    grpc_interfaces_output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "grpc_interfaces"))

    # Ensure the output directory exists
    os.makedirs(grpc_interfaces_output_dir, exist_ok=True)

    # Collect all .proto files for the first command
    grpc_proto_files = [
        os.path.join(proto_src, "tools/grpc_interfaces", proto_file)
        for proto_file in os.listdir(os.path.join(proto_src, "tools/grpc_interfaces"))
        if proto_file.endswith(".proto")
    ]

    # Collect all .proto files in the root directory for the second command
    root_proto_files = [
        os.path.join(proto_src, proto_file)
        for proto_file in os.listdir(proto_src)
        if proto_file.endswith(".proto")
    ]

    print("grpc_proto_files",grpc_proto_files)
    print("root_proto_files",root_proto_files)
    #Compile the files in the grpc_interfaces folder
    if grpc_proto_files:
        subprocess.run(
            [
                "python", "-m", "grpc_tools.protoc",
                f"-I{proto_src}",
                f"--python_out={grpc_interfaces_output_dir}",
                f"--pyi_out={grpc_interfaces_output_dir}",
                f"--grpc_python_out={grpc_interfaces_output_dir}",
                *grpc_proto_files,
            ],
            check=True,
        )

    # Compile the root-level .proto files
    if root_proto_files:
        subprocess.run(
            [
                "python", "-m", "grpc_tools.protoc",
                f"-I{proto_src}",
                f"--python_out=grpc_interfaces/",
                f"--pyi_out=grpc_interfaces/",
                f"--grpc_python_out=grpc_interfaces/",
                *root_proto_files,
            ],
            check=True,
        )

run()