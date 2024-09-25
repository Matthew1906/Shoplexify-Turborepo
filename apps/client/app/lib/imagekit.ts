import ImageKit from "imagekit";

const publicKey : string = process.env.IMAGEKIT_PUBLICKEY!;
const privateKey : string = process.env.IMAGEKIT_PRIVATEKEY!;
const urlEndpoint : string =  process.env.IMAGEKIT_URL!;

const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

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
    if(files.length==1){
        const fileId = files[0].fileId;
        await imagekit.deleteFile(fileId);
        return true;
    } else {
        return false
    }
};