from setuptools import setup, find_packages

setup(
    name="inventory",
    author_email="alberton@science.xyz",
    version="0.1.0",
    description="Workcell inventory management system",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "fastapi==0.95.2",
        "uvicorn==0.22.0",
        "sqlalchemy==1.4.48",
        "pydantic==2.8.2",
    ],
)
