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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = void 0;
const SettingsModel_1 = __importDefault(require("../models/SettingsModel"));
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield SettingsModel_1.default.findOne({});
        return res.status(200).json(settings);
    }
    catch (error) {
        console.error("Error in getSettings:", error);
        return res.status(500).json({ message: "Error fetching settings" });
    }
});
exports.getSettings = getSettings;
