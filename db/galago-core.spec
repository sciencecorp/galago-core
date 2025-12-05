# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for building the Galago Core (FastAPI) executable.

Usage:
    pyinstaller galago-core.spec

This will create a single-directory bundle in dist/galago-core/
"""

import sys
from pathlib import Path

# Get the directory containing this spec file
spec_dir = Path(SPECPATH)
project_root = spec_dir.parent

block_cipher = None

# Collect all Python files from the db package
datas = [
    # Include alembic migrations
    (str(spec_dir / 'alembic'), 'db/alembic'),
    (str(spec_dir / 'alembic.ini'), 'db'),
]

# Hidden imports that PyInstaller might miss
hiddenimports = [
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    'uvicorn.lifespan.off',
    'sqlalchemy.dialects.sqlite',
    'pydantic',
    'pydantic.deprecated.decorator',
    'email_validator',
    'multipart',
    'db',
    'db.main',
    'db.models',
    'db.routers',
    'db.models.inventory_models',
    'db.models.log_models',
    'db.models.db_session',
    'db.schemas',
    'db.crud',
    'db.initializers',
    'db.dependencies',
    'db.exceptions',
    'db.config',
]

# Add all routers as hidden imports
routers = [
    'inventory', 'workcells', 'tools', 'nests', 'plates', 'wells',
    'reagents', 'scripts', 'script_folders', 'variables', 'labware',
    'settings', 'logs', 'protocols', 'hotels', 'forms', 'robot_arm', 'backup'
]
for router in routers:
    hiddenimports.append(f'db.routers.{router}')

a = Analysis(
    [str(spec_dir / 'entry_point.py')],
    pathex=[str(spec_dir), str(project_root)],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter',
        'matplotlib',
        'PIL',
        'numpy',
        'pandas',
        'scipy',
        'IPython',
        'jupyter',
        'notebook',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='galago-core',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Set to False for production to hide console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add icon path here for Windows/Mac
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='galago-core',
)

