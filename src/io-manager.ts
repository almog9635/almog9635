import promptSync from 'prompt-sync';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger/logger';

const prompt = promptSync();

export class IoManager
{

    private logger = Logger.getLogger();

    public getInput(request:string, validation:(input: string) => boolean):string
    {
        let startTime = Date.now();
        let input = prompt(request);
        while (!validation(input)) 
        {
            this.logger.info('input time', {elapsedTime:Date.now() - startTime});
            console.log("Invalid input")
            input = prompt(request);
        }
        this.logger.info('input time', {elapsedTime:Date.now() - startTime});

        return input;
    }

    /*  *****************************
                    files             
        *****************************/
    public getInputPath() : string
    {
        let startTime = Date.now();
        let file = prompt("enter file path: ");
        this.logger.info('path input time', {elapsedTime:Date.now() - startTime});

        return file;
    }

    public saveFile(data:Buffer | string, path:string, format?:string) : void {
        try 
        {
            let startTime = Date.now();
            fs.writeFileSync(path + (format? format: ""), data);
            this.logger.info('time to write file', {elapsedTime:Date.now() - startTime});
            this.logger.info('file path ' + path + (format? format: ""));
        }
        catch(error) {
            this.logger.error("Error reading file: " + String(error));
            
            throw error;
        }
    }

    public getFileData(path:string) : Buffer
    {
        try
        {
            let startTime = Date.now()
            let data = fs.readFileSync(path);
            this.logger.info('time to read file', {elapsedTime:Date.now() - startTime});
            this.logger.info('file path ' + path);

            return data; 
        }
        catch(error)
        {
            this.logger.error("Error reading file: " + String(error));

            throw error;
        }
    }

    public readFolder(folderPath:string)
    {
        try
        {
            return fs.readdirSync(folderPath);
        }
        catch(error)
        {
            this.logger.error("Error reading folder: " + String(error));

            throw error;
        }
    }

    public isFile(filePath:string): boolean
    {
        return fs.statSync(filePath).isFile()
    }

    public isDirectory(filePath: string): boolean 
    {
        const stats = fs.statSync(filePath);

        return stats.isDirectory();
    }

    public createDirectory(path:string) 
    {
        try
        {
            if(!fs.existsSync(path))
            {
                let startTime = Date.now();
                fs.mkdirSync(path);
                this.logger.info('time to create directory', {elapsedTime:Date.now() - startTime});
                this.logger.info('directory path ' + path);
            }
            else
            {
                this.logger.info("folder exists");
            }
        }
        catch(error)
        {
            this.logger.error("Error reading folder: " + String(error));
            
            throw error;
        }
    }

    public printJsonExmaple()
    {
        console.log("json file example:");
        console.log({
            "encrypt": false,
            "path" : "C:\\Users\\idoma\\Desktop\\almog yd\\projects\\TypeScript\\src\\texts-encrypted",
            "format": "caesar",
            "iterations": "5"
        });
    }
}