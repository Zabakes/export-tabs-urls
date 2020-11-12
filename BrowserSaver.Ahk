goSub, openBrowser
return

openBrowser:
    ;FileAppend ,, OutPut.txt
    BrowserPath := DefaultBrowser()

    loop, Read, %1%
    {   
        if(InStr(BrowserPath, "FireFox")){
            newWindowFlag := " -new-window "
            newTabFlag := " -new-tab "
        }Else{
            if(InStr(BrowserPath, "Chrome")){
                newWindowFlag := " --new-window "
                newTabFlag := " "
            }else{
                MsgBox, BrowserPath does not point at a supported browser
                return
            }
        }
        Sleep, 1000
        If (A_index = 1){
            ;FileAppend , % DefaultBrowser() " -new-window " A_LoopReadLine "`n", OutPut.txt
            Run, % BrowserPath newWindowFlag A_LoopReadLine,,, TabId
            Process, Wait, %TabId% , 1000
        }else{
            ;FileAppend , % DefaultBrowser() " -new-tab " A_LoopReadLine "`n", OutPut.txt
            Run, % BrowserPath newTabFlag A_LoopReadLine,,, TabId
            Process, Wait, %TabId% , 1000
        }

    }
    return

DefaultBrowser() {
	; Find the Registry key name for the default browser
	RegRead, BrowserKeyName, HKEY_CURRENT_USER, Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.html\UserChoice, Progid

	; Find the executable command associated with the above Registry key
	RegRead, BrowserFullCommand, HKEY_CLASSES_ROOT, %BrowserKeyName%\shell\open\command

	; The above RegRead will return the path and executable name of the brower contained within quotes and optional parameters
	; We only want the text contained inside the first set of quotes which is the path and executable
	; Find the ending quote position (we know the beginning quote is in position 0 so start searching at position 1)
	StringGetPos, pos, BrowserFullCommand, ",,1

	; Decrement the found position by one to work correctly with the StringMid function
	pos := --pos

	; Extract and return the path and executable of the browser
	StringMid, BrowserPathandEXE, BrowserFullCommand, 2, %pos%
	Return BrowserPathandEXE
}