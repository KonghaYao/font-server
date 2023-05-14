import os from 'os'
import path from 'path'
export const getTempPath  = (foldername:string,filename:string)=>{
    return path.join(os.tmpdir() ,foldername,filename);
}