const fs = require('fs-extra');
const path = require('path');

fs.ensureDirSync('./processed_package/messages');

const messageIndex = require('./package/messages/index.json');

let messageIndexCounter = 0;
let messageIndexCounterLimit = 1000;

let directMessageContainer = {};
let deletedUsersContainer = {};
let attachmentsArray = [];

const replaceList = [
	['<', '&lt;'],
	['>', '&gt;'],
	['?', '(question mark)']
];

for (index in messageIndex) {
	if (messageIndex[index] === null) {
		continue;
	} else if (messageIndex[index].length < 20) {
		continue;
	} else if (messageIndexCounter > messageIndexCounterLimit) {
		continue;
	}
	
	if (messageIndex[index].slice(0, 20) === 'Direct Message with ') {
		let directMessages = fs.readFileSync(`./package/messages/c${index}/messages.csv`, { encoding: 'utf8', flag: 'r' });
		directMessages = directMessages.split('\n').slice(1,-1); // remove 'ID,Timestamp,Contents,Attachments\r\n'
		for (subindex in directMessages) {
			directMessageArguments = directMessages[subindex].split(',');
			directMessages[subindex] = {}; // convert array to object so variables can be assigned with names
			directMessages[subindex].id = directMessageArguments[0];
			directMessages[subindex].timestamp = directMessageArguments[1];
			directMessages[subindex].contents = directMessageArguments[2];
			directMessages[subindex].attachments = directMessageArguments[3];
			if (directMessageArguments[3] && directMessageArguments[3].slice(0, 39) === "https://cdn.discordapp.com/attachments/") {
				attachmentsArray.push(directMessageArguments[3]);
			}
		}

		let directMessageObjectTag = messageIndex[index].slice(20);
		for (index in replaceList) {
			directMessageObjectTag = directMessageObjectTag.replace(replaceList[index][0], replaceList[index][1]); // tag validation for file names
		}

		let directMessageObject = {
			"messages": directMessages
		};

		directMessageContainer[directMessageObjectTag] = directMessageObject;

		if (directMessageObjectTag.slice(0,13) === 'Deleted User ') {
			deletedUsersContainer[directMessageObjectTag] = directMessageObject;
		}

		fs.writeFileSync(`./processed_package/messages/${directMessageObjectTag}.json`, JSON.stringify(directMessageObject, null, '\t'));
	}

	messageIndexCounter++;
}

fs.writeFileSync('./processed_package/_all_attachments.json', JSON.stringify(attachmentsArray, null, '\t'));
fs.writeFileSync('./processed_package/_all_messages.json', JSON.stringify(directMessageContainer, null, '\t'));
fs.writeFileSync('./processed_package/_deleted_messages.json', JSON.stringify(deletedUsersContainer, null, '\t'));