# How to use
1. Clone the repository into a new folder.
2. Unzip your Discord data and drag + drop the folder containing your Discord data (should be named "package") into the repository folder. If you have not requested your Discord data, you can do so in the Privacy & Safety tab in User Settings. Discord will then email you a link to download your archived data within a few days.
3. Press Ctrl + ` to open a new terminal window and type "npm install" to install dependencies.
4. Type "node ." to parse your Discord data (just messages for now).
5. If you wish to download all your attachments, you can do so by typing "node .\download_attachments.js". Increment the counter by 100 each time until you have downloaded all of your attachments - trying to download all attachments at once may result in undocumented network behaviour.

# Known Issues
No known issues (future issues may be caused by PapaParse - may start coding custom, more lightweight CSV parser to with double quote detection in case messages contain commas)