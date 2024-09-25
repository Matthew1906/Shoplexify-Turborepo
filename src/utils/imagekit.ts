import ImageKit from "imagekit";
import config from '../config';

const imagekit = new ImageKit({ 
    publicKey:config.IMAGEKIT_PUBLICKEY, 
    privateKey:config.IMAGEKIT_PRIVATEKEY, 
    urlEndpoint:config.IMAGEKIT_URL 
});

export const uploadImage = (file:string, filename:string, folder:string) => 
    imagekit.upload({
        file : file,
        fileName : filename,
        useUniqueFileName: false,
        folder: `/shoplexify/${folder}/`
    }).then(res=>({imageId:res.fileId, image:res.url}))
    // .catch(err=>{console.log(err);console.log(filename)});

export const deleteFile = async(filename:string)=>{
    const files = await imagekit.listFiles({
        name: filename,
        limit:1,
    })
    if(files.length==1 && files[0]){
        const fileId = files[0].fileId;
        await imagekit.deleteFile(fileId);
        return true;
    } else {
        return false
    }
};