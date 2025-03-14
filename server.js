const express = require("express")
const path = require("path")
const app = require("./app") // Import your app.js file
const PORT = process.env.PORT || 3000

// Serve static files from the React app
const staticPath = path.join(__dirname, "dist")
app.use(
  express.static(staticPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript")
      }
      console.log("Serving:", filePath);
    },
  })
)

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"))
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})