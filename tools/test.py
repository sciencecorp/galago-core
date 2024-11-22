import os
from setuptools import setup, find_namespace_packages
import os
import subprocess
from setuptools.command.build_py import build_py as _build_py
from os.path import join, dirname, realpath
import shutil 

def run():
    ROOT = os.path.join(os.path.dirname(__file__))
    print("Root is" + ROOT)
    proto_src = os.path.join(dirname(dirname(os.path.realpath(__file__))), "interfaces")
    grpc_interfaces_output_dir = os.path.abspath(os.path.join(ROOT, "grpc_interfaces"))
    print("Output dir is" + grpc_interfaces_output_dir)

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
                f"--python_out=grpc_interfaces/",
                f"--pyi_out=grpc_interfaces/",
                f"--grpc_python_out=grpc_interfaces",
                *grpc_proto_files,
            ],
            check=True,
        )

    for file in os.listdir(os.path.join(grpc_interfaces_output_dir,"tools","grpc_interfaces")):
        print("Moving file" + file)
        if file.endswith(".py") or file.endswith(".pyi"):
            shutil.move(os.path.join(grpc_interfaces_output_dir,"tools","grpc_interfaces", file), os.path.join(grpc_interfaces_output_dir, file))
    
    # os.rmdir(os.path.join(grpc_interfaces_output_dir,"tools","grpc_interfaces"))
    # os.rmdir(os.path.join(grpc_interfaces_output_dir,"tools"))

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