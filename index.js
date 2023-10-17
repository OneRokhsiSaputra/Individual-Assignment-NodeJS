require("dotenv").config();
const bodyParser = require("body-parser");

const app = require("express")();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("./model/DBsync");

require("./routes/users")(app);
require("./routes/posts")(app);
require("./routes/categories")(app);

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
