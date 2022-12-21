const fs = require('fs');
const path = require('path');
const messageIndex = require('./package/messages/index.json');

let messageIndexCounter = 0;
let messageIndexCounterLimit = 1000;

const replaceList = [
	['<', '&lt;'],
	['>', '&gt;'],
	['?', '(question mark)']
];

const messagesPath = path.dirname('./package/messages');
const processedMessagesPath = path.dirname('./processed_messages');

for (index in messageIndex) {
	if (messageIndex[index] === null) {
		continue;
	} else if (messageIndex[index].length < 20) {
		continue;
	} else if (messageIndexCounter > messageIndexCounterLimit) {
		continue;
	}
	
	if (messageIndex[index].slice(0, 20) === 'Direct Message with ') {
		let directMessageObject = {};

		directMessageObject.id = index;
		directMessageObject.tag = messageIndex[index].slice(20);

		let directMessages = fs.readFileSync(`./package/messages/c${index}/messages.csv`, { encoding: 'utf8', flag: 'r' });
		directMessages = directMessages.split('\n').slice(1,-1); // remove 'ID,Timestamp,Contents,Attachments\r\n'
		for (subindex in directMessages) {
			directMessageArguments = directMessages[subindex].split(',');
			directMessages[subindex] = {}; // convert array to object so variables can be assigned with names
			directMessages[subindex].id = directMessageArguments[0];
			directMessages[subindex].timestamp = directMessageArguments[1];
			directMessages[subindex].contents = directMessageArguments[2];
			directMessages[subindex].attachments = directMessageArguments[3];
		}
		directMessageObject.messages = directMessages;

		directMessageObjectTag = directMessageObject.tag;
		for (index in replaceList) {
			directMessageObjectTag = directMessageObjectTag.replace(replaceList[index][0], replaceList[index][1]); // tag validation for file names
		}

		fs.writeFileSync(`./processed_messages/${directMessageObjectTag}.json`, JSON.stringify(directMessageObject, null, '\t'));
	}

	messageIndexCounter++;
}