import {config} from "./config-interface"
import { IoManager } from "../io-manager";
import { Logger } from "../logger/logger";

export class console implements config
{
    private ioManager = new IoManager();
    private logger = new Logger();

    public setUpConfig()
    {
        let choice = this.ioManager.getInput("encrypt or decrypt?", input => ["encrypt", "decrypt"].includes(input));
        let encryptionChoice = this.ioManager.getInput("choose how do you want caesar or multiply?", input => ["caesar", "multiply"].includes(input));

        let iterations = this.ioManager.getInput("how many iterations?", input => !isNaN(Number(input)) && Number(input) > 0 );

        let path = this.ioManager.getInputPath();
        let isEncrypt = (choice === "encrypt")? true : false;
        return {isEncrypt, path, encryptionChoice, iterations};
    }
}