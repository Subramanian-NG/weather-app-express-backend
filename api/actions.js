require("dotenv").config();
const express = require("express");

const app = express();
const db = require("../config/db");
const bodyParser = require("body-parser");

//middlewares to parse body form data in URL encoded form and JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

router.post('/bookmark', async (req, res) => {
    const { userId, city } = req.body;
    //if loggedin user try to access route with different userId in param, throw unauthorization error
    if (userId !== req.decodedUserId) { 
        return res.status(403).json({ message: "Not authorized to perform action on other user" });
    }

    if (!city || city.trim() === "") {
        return res.status(400).json({ message: "City cannot be empty" });
    }
    try {
        const result = await db.bookmarkCity(userId, city);
        res.json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});
  
router.get('/bookmarks/:userId', async (req, res) => {
    const { userId } = req.params;
    //if loggedin user try to access route with different userId in param, throw unauthorization error
    if (userId !== req.decodedUserId) { 
        return res.status(403).json({ message: "Not authorized to perform action on other user" });
    }

    try {
        const bookmarks = await db.getBookmarks(userId);
        res.json(bookmarks);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.delete('/bookmark', async (req, res) => {
    const { userId, city } = req.body;
    //if loggedin user try to access route with different userId in param, throw unauthorization error
    if (userId !== req.decodedUserId) { 
        return res.status(403).json({ message: "Not authorized to perform action on other user" });
    }

    if (!city || city.trim() === "") {
        return res.status(400).json({ message: "City cannot be empty" });
    }
    try {
        const result = await db.removeBookmark(userId, city);
        res.json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
