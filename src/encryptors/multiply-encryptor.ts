import { encryptor } from './encryptor';
import { Logger } from '../logger/logger';
const asciiSize = 256;

export class MultiplyEncryptor implements encryptor
{

    private logger = Logger.getLogger();

    private multiplyMessage(message:Buffer, iterations:number, multiply:number) : Buffer
    {
        let startTime = Date.now();
        let buffer = Buffer.from(message);
        
        for (let i = 0; i < iterations; i++) 
        {
            for (let j = 0; j < buffer.length; j++) 
            {
                buffer[j] = (buffer[j] * multiply) % asciiSize;
            }
        }
        this.logger.info('time to encrypt', {elapsedTime:Date.now() - startTime});

        return buffer;
    }

    //multiply encryption
    public encrypt(data: Buffer, iterations:number, key:number): Buffer 
    {
        return this.multiplyMessage(data, iterations, key);
    }

    private mod(n: number, m: number): number 
    {
        return ((n % m) + m) % m;
    }

    //multiply decryption
    public decrypt(data: Buffer, iterations:number, key:number): Buffer 
    {
        //finding the inverse value
        const modInverse = (a: number, m: number): number => {
            a = this.mod(a, m);
            for (let x = 1; x < m; x++)
            {
                if (this.mod((a * x), m) === 1) 
                {
                    return x;
                }
            }
            return 0;
        };
        let inverse = modInverse(key, asciiSize);
        
        return this.multiplyMessage(data, iterations, inverse);
    }

    public generateKey(): number 
    {
        let key = Math.floor(Math.random() * 253 + 2);
            while(key % 2 !== 1)
            {
                key = Math.floor(Math.random() * 253 + 2);
            }

        return key;
    }
}