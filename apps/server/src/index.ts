import cors from "cors";
import express from "express";
import config from "./config";
import router from "./routes";

const app = express();

// Basic configuration
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended:true}));
app.use(cors({origin:config.CLIENT_URL}))

// Routes
app.use("/api/admin", router.adminRouter);
app.use("/api/cart", router.cartRouter);
app.use("/api/categories", router.categoryRouter);
app.use("/api/login", router.loginRouter);
app.use("/api/products", router.productRouter);
app.use("/api/reviews", router.reviewRouter);
app.use("/api/transactions", router.transactionRouter);
app.use("/api/users", router.userRouter);

// Etc.
app.listen(config.PORT, () =>
  console.log(`App listening on PORT ${config.PORT}`)
);

app.use((_req:express.Request, res:express.Response, next:express.NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', "POST, PUT, PATCH, GET, DELETE");
  next();
});

app.get("/", async(req:express.Request, res:express.Response)=>{
    res.json({message:"Hello, It's me! I've been wondering if after all these years you would like to meet"})
})