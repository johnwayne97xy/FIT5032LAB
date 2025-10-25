const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Initialize the Firebase Admin SDK
admin.initializeApp();

// cloud function to count documents in the "books" collection
exports.countBooks = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const booksCollection = admin.firestore().collection("books");
      const snapshot = await booksCollection.get();
      const count = snapshot.size;

      res.status(200).send({count});
    } catch (error) {
      console.error("Error counting books:", error.message);
      res.status(500).send("Error counting books");
    }
  });
});

const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// cloud function to capitalize string in new book
exports.capitalizeBookData = onDocumentCreated("books/{bookId}",
    async (event) => {
      const snap = event.data;
      if (!snap) return;

      const data = snap.data();

      // capitalize all string fields in the document
      const capitalizedData = {};
      for (const key in data) {
        if (typeof data[key] === "string") {
          capitalizedData[key] = data[key].toUpperCase();
        } else {
          capitalizedData[key] = data[key];
        }
      }

      // update the document with capitalized data
      await snap.ref.update(capitalizedData);
      console.log("Book data capitalized:", capitalizedData);
    });
