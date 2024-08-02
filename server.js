const app=require("./app")
const {connectDatabase}=require("./database/connect")
connectDatabase()


app.listen(process.env.PORT,()=>{
    console.log(`Srever is runnimg on port ${process.env.PORT}`);
})