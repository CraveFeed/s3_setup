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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const s3 = new client_s3_1.S3({
    credentials: {
        accessKeyId: 'AKIATTSKFQ23MFLF5HPB',
        secretAccessKey: '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',
    },
    region: 'ap-southeast-2',
});
const upload = (0, multer_1.default)();
app.post('/upload', upload.single('photo'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const imageName = file.originalname;
        const uploadParams = {
            Bucket: 'ride2024',
            Key: imageName,
            Body: file.buffer,
            ContentType: file.mimetype
        };
        yield s3.send(new client_s3_1.PutObjectCommand(uploadParams));
        const signedUrlParams = {
            Bucket: 'ride2024',
            Key: imageName,
        };
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.GetObjectCommand(signedUrlParams), { expiresIn: 50000 });
        console.log(signedUrl);
        res.status(200).json({ signedUrl });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
}));
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
