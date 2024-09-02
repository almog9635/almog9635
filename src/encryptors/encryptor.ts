export interface encryptor
{
    encrypt(data : Buffer, iterations:number, key:number) : Buffer;
    decrypt(data : Buffer, iterations:number, key:number) : Buffer;
    generateKey() : number;
}
