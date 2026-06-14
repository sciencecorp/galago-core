' ============================================================================
' Hidden launcher for the Galago Tools supervisor.
'
' The "Galago Tools" scheduled task runs this via wscript.exe. wscript is a
' GUI host (no console of its own), and Run(..., 0, ...) starts the supervisor
' with its console window HIDDEN -- so there is no window for a lab user to
' accidentally close. The console still exists (it is just not shown), so the
' Manager's child tool processes inherit it and do not spawn their own windows
' either. All output still goes to %USERPROFILE%\galago-tools.log.
'
' To run the supervisor VISIBLY for debugging, just double-click / run
' start-galago-tools.cmd directly instead of going through this shim.
' ============================================================================
Dim fso, shell, here, target
Set fso   = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
here   = fso.GetParentFolderName(WScript.ScriptFullName)
target = "cmd /c """ & here & "\start-galago-tools.cmd"""
' 0 = hidden window, False = do not wait for it to exit
shell.Run target, 0, False
