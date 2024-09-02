import { encryptor } from './encryptor';
import { Logger } from '../logger/logger'

export class CaesarEncryptor implements encryptor
{

    private logger = Logger.getLogger();

    private shiftMessage(message:Buffer, iterations:number, shiftNumber:number, isEncrypt:boolean) : Buffer
    {
        let startTime = Date.now();
        for(let j : number = 0; j < iterations; j++)
        {
            for(let i : number = 0; i < message.length; i++)
            {
                message[i] = message[i]+ shiftNumber;
                message[i] %=256;
            }
        }
        this.logger.info('time to encrypt', {elapsedTime:Date.now() - startTime});
        return message;
    }
    
    // the function does caesar encryption
    public encrypt(data : Buffer, iterations:number, key:number): Buffer
    {
        return this.shiftMessage(data, iterations, key , true);
    }

    // the function does caesar dencryption
    public decrypt(data : Buffer, iterations:number, key:number): Buffer
    {
        return this.shiftMessage(data, iterations, 256 - key, false);
    }

    public generateKey(): number
    {
        return Math.floor(Math.random() * 253 + 2);
    }
}