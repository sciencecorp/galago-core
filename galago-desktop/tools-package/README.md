# Galago Tools Package

This package contains the pre-built tool drivers for Galago Desktop.

## Installation

### Automatic Installation (Recommended)

1. Open Galago Desktop
2. Go to **Settings** > **Tools**
3. Click **Install Tools**
4. Select the `galago-tools-macos.zip` file
5. The tools will be installed to your user data directory

### Manual Installation

1. Extract `galago-tools-macos.zip` to a folder
2. Copy the contents of the `tools` folder to:
   - **macOS**: `~/Library/Application Support/Galago/data/tools/`
   - **Windows**: `%APPDATA%\Galago\data\tools\`
   - **Linux**: `~/.config/Galago/data/tools/`

## Included Tools

| Tool | Description |
|------|-------------|
| alps3000 | ALPS 3000 plate sealer driver |
| bioshake | BioShake microplate shaker driver |
| bravo | Agilent Bravo liquid handler driver |
| cytation | BioTek Cytation plate reader driver |
| dataman70 | Cognex DataMan barcode reader driver |
| hamilton | Hamilton STAR/NIMBUS driver |
| hig_centrifuge | HiG centrifuge driver |
| liconic | Liconic incubator driver |
| microserve | Microserve driver |
| opentrons2 | Opentrons OT-2 robot driver |
| pf400 | Precise Automation PF400 robot driver |
| plateloc | Agilent PlateLoc thermal sealer driver |
| plr | PlateLocator driver |
| pyhamilton | PyHamilton integration driver |
| spectramax | Molecular Devices SpectraMax reader driver |
| toolbox | Tool Box controller driver |
| vcode | VCode barcode reader driver |
| vprep | Agilent VPrep driver |
| xpeel | Brooks XPeel plate sealer driver |

## Platform Support

- **macOS**: Universal (arm64 + x64) - `galago-tools-macos.zip`
- **Windows**: Coming soon - `galago-tools-windows.zip`
- **Linux**: Coming soon - `galago-tools-linux.zip`

## Updating Tools

To update tools, simply re-install the latest tools package. The new tools will replace the existing ones.

## Building from Source

To build the tools from source:

```bash
cd galago-tools
./scripts/build_all.sh
```

The built tools will be in `galago-tools/dist/tools/`.

## Troubleshooting

### Tool not starting

1. Check if the tool binary has execute permissions (macOS/Linux):
   ```bash
   chmod +x ~/Library/Application\ Support/Galago/data/tools/toolname/toolname
   ```

2. Check the Galago Desktop console (Help > Toggle Developer Tools) for error messages.

### Tool not recognized

Make sure the tool folder structure is correct:
```
tools/
├── pf400/
│   └── pf400       # The executable
├── liconic/
│   └── liconic     # The executable
...
```

