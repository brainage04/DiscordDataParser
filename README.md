# How to use
1. Clone the repository into a new folder.
2. Create a new folder in the repository folder called "processed_packages".
3. Unzip your Discord data and drag + drop the files into the repository folder. If you have not requested your Discord data, you can do so in the Privacy & Safety tab in User Settings.
4. Press Ctrl + ` to open a new terminal window and type "npm install" to install dependencies.
5. Type "node ." to parse your Discord data (just messages for now).
6. If you wish to download all your attachments, you can do so by typing "node .\download_attachments.js". Increment the counter by 100 each time until you have downloaded all of your attachments.