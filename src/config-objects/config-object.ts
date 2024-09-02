import {config} from "./config-interface"
import { IoManager } from "../io-manager";
import { Logger } from "../logger/logger";

export class configFile implements config
{
    private ioManager = new IoManager();
    private logger = new Logger();

    public setUpConfig(flag?:boolean)
    {
        let isExample = flag? "no" : this.ioManager.getInput("do you wish for example?", input => ["yes", "no"].includes(input));
        if(isExample === "yes")
        {
            this.ioManager.printJsonExmaple();
        }
        let configPath = this.ioManager.getInputPath();
        let data = this.ioManager.getFileData(configPath);
        let configData = JSON.parse(data.toString());
        this.logger.info(configData);
        let isEncrypt = configData.encrypt;
        let path = configData.path;
        let encryptionChoice = configData.format;
        let iterations = configData.iterations;
        return {isEncrypt, path, encryptionChoice, iterations};
    }
}