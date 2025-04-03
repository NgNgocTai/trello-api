connectDb()
  .then(console.log('Connected to mongoDb'))
  .then(() => startServer())
  .catch(error =>{
    console.log(error)
    //out 
    process.exit(0)
  })
