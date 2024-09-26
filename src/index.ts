import express, { Request, Response } from 'express';
import multer from 'multer';
import { S3, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import cors from 'cors';

const app = express();
app.use(cors());

const s3 = new S3({
    credentials: {
        accessKeyId: 'AKIATTSKFQ23MFLF5HPB',
        secretAccessKey: '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',
    },
    region: 'ap-southeast-2',
});

const upload = multer();

app.post('/upload', upload.single('photo'), async (req: Request, res: Response)=> {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const uniqueImageName = `${Date.now()}-${file.originalname}`;
        const uploadParams = {
            Bucket: 'ride2024',
            Key: uniqueImageName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        const signedUrlParams = {
            Bucket: 'ride2024',
            Key: uniqueImageName,
        };
        const signedUrl = await getSignedUrl(s3, new GetObjectCommand(signedUrlParams), { expiresIn: 50000 });

        console.log(signedUrl);
        res.status(200).json({ signedUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
