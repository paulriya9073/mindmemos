const express=require("express")
const app=express()
const cookieParser=require("cookie-parser")
const cors=require("cors")
const path=require("path")

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "config/config.env" });
  }

  //using middlewares
  app.use(express.json())
  app.use(express.urlencoded({extended:true}))
  app.use(cookieParser())
 app.use(cors())

  //importing routes
  const user=require("./routes/user")
  const note=require("./routes/note")


  //using routes
  app.use("/api/user",user);
  app.use("/api/note",note)

  app.use(express.static(path.join(__dirname,"./dist")))
  app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"./dist/index.html"))
  })


  module.exports=app