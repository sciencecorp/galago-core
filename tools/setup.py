import os
from setuptools import setup, find_namespace_packages
import os
import subprocess
from setuptools.command.build_py import build_py as _build_py
from os.path import join, dirname, realpath
import shutil 

class BuildProtobuf(_build_py):
   def run(self):
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
                    f"--python_out=grpc_interfaces/",
                    f"--pyi_out=grpc_interfaces/",
                    f"--grpc_python_out=grpc_interfaces/",
                    *grpc_proto_files,
                ],
                check=True,
            )

        for file in os.listdir(os.path.join(grpc_interfaces_output_dir,"tools","grpc_interfaces")):
            if file.endswith(".py") or file.endswith(".pyi"):
                shutil.move(os.path.join(grpc_interfaces_output_dir,"tools","grpc_interfaces", file), os.path.join(grpc_interfaces_output_dir, file))
        

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

        # Call the original build command
        super().run()



def readme() -> str:
    readme_path = os.path.join(os.path.dirname(__file__), "README.md")
    if os.path.exists(readme_path):
        return open(readme_path).read()
    return ""

def read_requirements(filename):
    requirements_path = os.path.join(os.path.dirname(__file__), filename)
    with open(requirements_path) as f:
        return [line.strip() for line in f
                if line.strip() and not line.startswith('#')]

def find_tool_packages():
    """Find all packages and subpackages in the current directory"""
    packages = ['tools']
    base_dir = os.path.dirname(os.path.abspath(__file__))
    for root, dirs, files in os.walk('.'):
        if '__init__.py' in files and root != '.':
            # Convert path to package name
            package_path = root.lstrip('./').replace('/', '.')
            print(package_path)
            if package_path:
                packages.append(f'tools.{package_path}')
    print("All packages found: ", packages)
    return packages.append('tools.grpc_interfaces.*')

find_tool_packages()
setup(
    name='galago_tools',
    version='0.1.0',
    packages=find_tool_packages(),  # Explicitly specify the package
    package_dir={'tools': '.'},  # Tell setuptools where to find the package
    license='Apache',
    description='Open Source Lab Orchestration Software',
    long_description=readme(),
    install_requires=read_requirements('requirements.txt'),
    include_package_data=True,
    package_data={'tools': ['*.dll',"site_logo.png","favicon.ico",'grpc_interfaces/*.py']},
    url='https://github.com/sciencecorp/galago-core',
    author='Science Corporation',
    python_requires=">=3.9",
    author_email='',
    long_description_content_type="text/markdown",
    entry_points={
        'console_scripts': [
            'galago-run=tools.cli:launch_all_servers',  # Changed because we're inside the tools directory
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",  # Fixed license classifier
        "Operating System :: OS Independent",
    ],
    cmdclass={
        'build_py': BuildProtobuf,
    },
)