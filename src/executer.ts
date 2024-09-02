import { CaesarEncryptor } from './encryptors/caesar-encryptor';
import { MultiplyEncryptor } from './encryptors/multiply-encryptor';
import { encryptor } from './encryptors/encryptor';
import { IoManager } from './io-manager';
import path from 'path';
import { Logger } from './logger/logger';
import {config} from './config-objects/config-interface'
import { console } from './config-objects/console-object';
import { configFile } from './config-objects/config-object';

const encrypt = "-encrypted";
const decrypt = "-decrypted";
const keyAddOn = "-key.txt";

export class Executer
{

    private encryptor : encryptor;
    private ioManager : IoManager;
    private configObject : config;
    private logger = Logger.getLogger();

    public constructor()
    {
        this.encryptor = {} as encryptor;
        this.configObject = {} as config;
        this.ioManager = new IoManager();
    }

    private factoryConfig(choice:string)
    {
        switch(choice)
        {
            case "console":
                return new console();
            case "config":
                return new configFile();
            default:
                throw new Error("Invalid input type");
        }
    }

    private factoryEncryptor(encryptionChoice:string) : encryptor
    {
        switch (encryptionChoice)
        {
            case "caesar":
                return new CaesarEncryptor();
            case "multiply":
                return new MultiplyEncryptor();
            default:
                throw new Error("Invalid encryption choice");
        }
    }

    private fileEncryptor(isEncrypt:boolean, filePath: string, iterations:number, folderPath?:string) : void
    {
        let data = this.ioManager.getFileData(filePath);
        let fileParts = filePath.split(".");
        let fileBaseName = fileParts[0];
        let fileExtension = "." + fileParts[1];
        let fileName = path.basename(filePath);
        let addOn = isEncrypt ? encrypt : decrypt;
        let outputFileName =  fileBaseName + addOn + fileExtension;

        let outputFilePath = folderPath? path.join(folderPath, fileName.split(".")[0] + addOn + fileExtension): outputFileName;

        if(isEncrypt)
        {
            let key = this.encryptor.generateKey();
            let keyFilePath = folderPath? path.join(folderPath, fileName.split(".")[0] + keyAddOn) : fileBaseName + keyAddOn;

            let encryptedData = this.encryptor.encrypt(data, iterations, key);
            this.ioManager.saveFile(encryptedData, outputFilePath);
            this.ioManager.saveFile(key.toString(), keyFilePath);
        }
        else
        {
            let keyFilePath = folderPath? path.join(folderPath.split(decrypt)[0], fileName.split(encrypt)[0] + keyAddOn): fileBaseName + keyAddOn;
            
            let key = this.ioManager.getFileData(keyFilePath).toString();
            let decryptedData = this.encryptor.decrypt(data, iterations, parseInt(key, 10));
            this.ioManager.saveFile(decryptedData, outputFilePath);
        }
    }

    private folderEncryptor(folderPath: string, isEncrypt: boolean, iterations: number): void
    {
        let files = this.ioManager.readFolder(folderPath);
        let startTime = Date.now();
        let addOn = isEncrypt? encrypt : decrypt;
        let encryptFolderPath = folderPath + addOn;
        this.ioManager.createDirectory(encryptFolderPath);
        
        files.forEach((file) => {
            let filePath = path.join(folderPath, file);

            if (this.ioManager.isFile(filePath) && !filePath.includes("-key"))
            {
                this.fileEncryptor(isEncrypt, filePath, iterations, encryptFolderPath);
            }
        });
        this.logger.info('folder encryption time: ', {elapsedTime:Date.now() - startTime});
    }
    

    public execute(filePath?:string, encryptOption?:string, formatOption?:string, iteration?:string) : void
    {
        let ioChoice = filePath? "config" : this.ioManager.getInput("do you wish to use console or config file or finish?", input => ["console", "config", "finish"].includes(input));
        while(ioChoice !== "finish")
        {
            let isEncrypt: boolean;
            let path: string;
            let encryptionChoice: string;
            let iterations: number;

            if (!filePath && !encryptOption && !formatOption && !iteration) 
            {
                this.configObject = this.factoryConfig(ioChoice);
                ({ isEncrypt, path, encryptionChoice, iterations } = this.configObject.setUpConfig());
            }
            else 
            {
                isEncrypt = (encryptOption === "encrypt");
                path = filePath!;
                encryptionChoice = formatOption!;
                iterations = parseInt(iteration!, 10);
            }
            this.encryptor = this.factoryEncryptor(encryptionChoice);

            if(this.ioManager.isDirectory(path))
            {
                this.folderEncryptor(path, isEncrypt, iterations);
            }
            else if(this.ioManager.isFile(path))
            {    
                this.fileEncryptor(isEncrypt, path, iterations);
            }
            ioChoice = filePath? "finish" : this.ioManager.getInput("do you wish to use console or config file or finish?", input => ["console", "config", "finish"].includes(input));
        }
    }
}


