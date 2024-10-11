
import os
from setuptools import setup, find_packages

def readme() -> str:
    return open(os.path.join(os.path.dirname(__file__), "README.md")).read()

setup(
    name='galago_tools',
    packages = ['galago_tools'],
    version='0.9.0',
    packages=find_packages(exclude=['']),
    license='MIT',
    description='Open Source Lab Orchestration Software',
    long_description=readme(),
    install_requires=['requests', 'pythonnet', 'pyserial'],
    package_data={'galago_core': ['*.dll']},
    url='https://github.com/sciencecorp/galago-core',
    author='Science Corporation',
    author_email='',
    entry_points={
        'console_scripts': [
            'galago-run = galago_tools.run:main',
            'galago-list-tools = '
            'galago-start-tool = ',
            'galago-stop-tool = ',
        ],
    },
)
