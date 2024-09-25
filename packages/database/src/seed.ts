import { configDotenv } from "dotenv";
import { prisma } from "."
import { generatePassword } from "@repo/password-utils";
import { products } from "./products";

configDotenv();

async function main(){
    // generate categories
    const existingCategories = await prisma.categories.count()
    const isCategoriesExist = existingCategories>0;
    if(!isCategoriesExist){
        await prisma.categories.createMany({
            data:[
                { name: "Automotive", slug:"automotive" }, { name: "Arts and Crafts", slug:"arts-and-crafts" },
                { name: "Books", slug:"books" }, { name: "Clothing", slug:"clothing" },
                { name: "Electronics", slug:"electronics" }, { name: "Food & Beverages", slug:"food-and-beverages" },
                { name: "Health & Beauty", slug:"health-and-beauty" }, { name: "Home & Garden", slug:"home-and-garden" },
                { name: "Office", slug:"office" }, { name: "Sports & Outdoor Activities", slug:"sports-and-outdoor-activities" },
            ]
        })
    }
    // generate admin
    const password = await generatePassword("admin")
    await prisma.users.upsert({
        where:{
            name:"admin"
        },
        update:{

        },
        create:{
            email:"admin@admin.com",
            name:"admin",
            password: String(password)
        }
    })
    // generate seed products
    const existingProducts = await prisma.products.count()
    const isProductExist = existingProducts>1;
    if(!isProductExist){
        products.forEach(async (product:any)=>{
            const newProduct = await prisma.products.upsert({
                where:{
                    name:product.name
                },
                update:{
                    description:product.description, 
                    price: product.price, 
                    stock: product.stock,
                    image_url: "https://ik.imagekit.io/matthew1906/shoplexify/" + product.slug + ".jpg" 
                }, 
                create:{
                    name: product.name,
                    slug: product.slug, 
                    description:product.description, 
                    price: product.price, 
                    stock: product.stock,
                    image_url: "https://ik.imagekit.io/matthew1906/shoplexify/" + product.slug + ".jpg" 
                }
            })
            await prisma.product_categories.deleteMany({
                where:{product_id:newProduct.id}
            });
            product.categories.forEach(async(category:string)=>{
                const existingCategory = await prisma.categories.findUnique({where:{name:category}});
                if (existingCategory){
                    await prisma.product_categories.create({
                        data:{
                            product_id: newProduct.id,
                            category_id: existingCategory.id
                        }
                    })
                }
            })
        })
    }
    
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })