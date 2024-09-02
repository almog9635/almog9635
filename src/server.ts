import express from 'express';
import multer from 'multer';
import { Executer } from './executer';
import path from 'path';
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

const upload = multer({ storage: storage });

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("hello from express");
});

app.post("/", upload.array('files'), async (req: express.Request, res: express.Response) => {
    console.log(req.files);
    console.log(req.body);
    const { encrypt, format, iteration } = req.body;
    let executor = new Executer();
    const files = req.files as Express.Multer.File[];
    const outputFiles: string[] = [];
    
    if (req.files && files.length > 0)
    {
        
        files.forEach(async (file: Express.Multer.File) => {
            try {
                executor.execute(file.path, encrypt, format, iteration);
                let encryptedFilePath = file.path.split('.')[0] + "-" + encrypt + "ed." + file.path.split('.')[1];
                outputFiles.push(encryptedFilePath); 
                res.status(200).json({ message: 'Multiple files were uploaded and processed successfully!' });

                const zipFileName = 'processed_files${Date.now()}.zip';
                const zipFilePath = path.join(__dirname, 'uploads', zipFileName);
                const output = fs.createWriteStream(zipFilePath);
                const archive = archiver('zip', { zlib: { level: 9 } });

                output.on('close', () => {
                    // After creating the ZIP, send it back to the client
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
    
                archive.on('error', (err) => {
                    console.error('Error creating ZIP archive:', err);
                    res.status(500).json({ message: 'Failed to create ZIP file.' });
                });
    
                archive.pipe(output);
                outputFiles.forEach(filePath => {
                    const fileName = path.basename(filePath);
                    archive.file(filePath, { name: fileName });
                });
    
                await archive.finalize();

            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);

                return res.status(500).json({ message: `Failed to process file ${file.originalname}` });
            }
        });
       
        
    }
    else
    {
        res.status(400).json({ message: 'No files were uploaded.' });
    }
});

app.listen(port, () => {
    console.log('now listening on port 8000');
});