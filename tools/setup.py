
import os
from setuptools import setup, find_packages

def readme() -> str:
    return open(os.path.join(os.path.dirname(__file__), "README.md")).read()

def read_requirements(filename):
    with open(filename) as f:
        return [line.strip() for line in f
                if line.strip() and not line.startswith('#')]
print(read_requirements('requirements.txt'))
setup(
    name='galago_tools',
    version='0.1.0',
    packages=find_packages(exclude=['']),
    license='MIT',
    description='Open Source Lab Orchestration Software',
    long_description=readme(),
    install_requires=read_requirements('requirements.txt'),
    package_data={'galago_core': ['*.dll']},
    url='https://github.com/sciencecorp/galago-core',
    author='Science Corporation',
    python_requires=">=3.9",
    author_email='',
    long_description_content_type="text/markdown",
    entry_points={
        'console_scripts': [
            'galago-run-tools=tools.cli:launch_all_servers',
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache License",
        "Operating System :: OS Independent",
    ],
)
