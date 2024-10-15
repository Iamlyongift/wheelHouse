"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEmails = void 0;
const googleapis_1 = require("googleapis");
const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});
const fetchEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth: oAuth2Client });
        const response = yield gmail.users.messages.list({
            userId: 'me',
            q: '',
            maxResults: 10,
        });
        const messages = response.data.messages || [];
        const emails = [];
        for (const message of messages) {
            const msg = yield gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            });
            emails.push(msg.data);
        }
        return res.status(200).json({ emails });
    }
    catch (error) {
        console.error('Error fetching emails:', error);
        return res.status(500).json({ message: 'Could not fetch emails', error });
    }
});
exports.fetchEmails = fetchEmails;
