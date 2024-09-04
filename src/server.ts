import express from 'express';
import multer from 'multer';
import { Executer } from './executer';
import path, { basename } from 'path';
import * as fs from 'fs';
import archiver from 'archiver';

const port = 8000;
const app: express.Express = express();

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

const upload = multer({ storage: storage });

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("hello from express");
});

app.post("/", upload.array('files'), async (req: express.Request, res: express.Response) => {
    console.log(req.files);
    console.log(req.body);
    const { encrypt, format, iteration } = req.body;
    const executor = new Executer();
    const files = req.files as Express.Multer.File[];
    const outputFiles: string[] = [];
    
    if (files && files.length > 0) {
        try {
            // Process files one by one using a `for...of` loop
            for (const file of files) {
                try {
                    if(!file.path.includes("-key.txt"))
                    {
                        executor.execute(file.path, encrypt, format, iteration);
                        const encryptedFilePath = file.path.split('.')[0] + "-" + encrypt + "ed." + file.path.split('.')[1];
                        outputFiles.push(encryptedFilePath); // Store processed files
                        const keyFilePath = file.path.split('.')[0] + "-key.txt";
                        outputFiles.push(keyFilePath);
                    }
                    
                } catch (error) {
                    console.error(`Error processing file ${file.originalname}:`, error);
                    return res.status(500).json({ message: `Failed to process file ${file.originalname}` });
                }
            }

            // Create ZIP archive after processing all files
            const zipFileName = `processed_files_${Date.now()}.zip`;
            const zipFilePath = path.join(__dirname, 'uploads', zipFileName);
            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.pipe(output);

            // Add all the processed files to the archive
            outputFiles.forEach(filePath => {
                const fileName = path.basename(filePath);
                archive.file(filePath, { name: fileName });
            });

            archive.on('error', (err) => {
                console.error('Error creating ZIP archive:', err);
                return res.status(500).json({ message: 'Failed to create ZIP file.' });
            });

            output.on('close', () => {
                // Send the ZIP file to the client after the archive is created
                res.download(zipFilePath, zipFileName, (err) => {
                    if (err) {
                        console.error('Error downloading file:', err);
                        // Clean up the ZIP file if there's an error
                        fs.unlink(zipFilePath, () => {});
                    } else {
                        // Clean up the ZIP file after a successful download
                        fs.unlink(zipFilePath, (unlinkErr) => {
                            if (unlinkErr) {
                                console.error('Failed to delete ZIP file:', unlinkErr);
                            }
                        });
                    }
                });
            });

            await archive.finalize();
        } catch (error) {
            console.error('Error processing files:', error);
            return res.status(500).json({ message: 'Failed to process files.' });
        }
    } else {
        return res.status(400).json({ message: 'No files were uploaded.' });
    }
});

app.listen(port, () => {
    console.log('now listening on port 8000');
});