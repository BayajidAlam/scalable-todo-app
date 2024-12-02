const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
const cookieParser = require("cookie-parser");

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// middlewares
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${
        res.statusCode
      } - ${duration}ms`
    );
  });

  next();
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@myclaster-1.wxhqp81.mongodb.net/?retryWrites=true&w=majority&appName=MyClaster-1`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//********************* verifyJWT middleware ************************//
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};
//********************* verifyJWT middleware ************************//

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    const db = client.db("scalable_todo");
    const usersCollection = db.collection("users");
    const notesCollection = db.collection("notes");

    //********************* health apis ************************//
    //base api
    app.get("/health", (req, res) => {
      const uptime = process.uptime();
      const days = Math.floor(uptime / (24 * 60 * 60));
      const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((uptime % (60 * 60)) / 60);
      const seconds = Math.floor(uptime % 60);

      res.json({
        status: "Up and running!",
        timestamp: new Date().toISOString(),
        uptime: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      });
    });
    //********************* health apis ************************//

    //********************* jwt api ************************//
    // JWT
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user, "user");
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "12hr",
      });
      res.send({ token });
    });
    //********************* jwt api ************************//

    //********************* users apis ************************//
    //insert a user to db
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user, "user");
      const query = { email: user.email };
      const isUserExist = await usersCollection.findOne(query);
      if (isUserExist) {
        return res.send({ message: "user already exist!" });
      }

      // Hash the password before storing it
      bcrypt.hash(user.password, saltRounds, async (err, hash) => {
        if (err) {
          return res
            .status(500)
            .send({ error: true, message: "Error hashing password" });
        }
        user.password = hash;
        const result = await usersCollection.insertOne(user);
        res.send(result);
      });
    });

    //get all users
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find({}).toArray();
      res.send(users);
    });

    // login user
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send({ error: true, message: "Invalid credentials" });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send({ error: true, message: "Invalid credentials" });
      }

      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      });
      res.send({ token });
    });

    //change password
    app.post("/change-password", async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const email = req.query.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      console.log(user);
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({
          error: true,
          message: "User not found!",
        });
      }

      // Compare the provided current password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
          error: true,
          message: "Current password does not match!",
        });
      }

      // Hash the new password before storing it
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      const filter = { email };
      const updatedDoc = {
        $set: {
          password: hashedNewPassword,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send({
        error: false,
        data: result,
        message: "Password changed successfully!",
      });
    });

    //********************* users apis ************************//

    //********************* notes apis ************************//
    // create a note
    app.post("/notes", async (req, res) => {
      const { title, content, isArchived, isTrashed, isTodo, todos } = req.body;
      const email = req.query.email;
      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(404).send({
          error: true,
          message: "User not found",
        });
      }

      const note = {
        title,
        content,
        isArchived,
        isTrashed,
        email: email,
        isTodo,
        todos: isTodo ? todos : [],
        createdAt: new Date(),
      };

      const result = await notesCollection.insertOne(note);
      res.send(result);
    });

    //get all notes with search and sorting
    app.get("/notes", async (req, res) => {
      try {
        const { email, searchTerm, isArchived, isTrashed } = req.query;

        if (!email) {
          return res.status(400).send({
            error: true,
            message: "Email parameter is required",
          });
        }

        let query = { email };

        // Add archive/trash filters if provided
        if (isArchived !== undefined) {
          query.isArchived = isArchived === "true";
        }

        if (isTrashed !== undefined) {
          query.isTrashed = isTrashed === "true";
        }

        // Add search if provided
        if (searchTerm) {
          query = {
            ...query,
            $or: [
              { title: { $regex: searchTerm, $options: "i" } },
              { content: { $regex: searchTerm, $options: "i" } },
            ],
          };
        }

        const notes = await notesCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.send(notes);
      } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).send({
          error: true,
          message: "Error fetching notes",
        });
      }
    });

    // Update note
    // Update note
    app.patch("/notes/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { isArchived, isTrashed, title, content, todos, isTodo } =
          req.body;
        const email = req.query.email;

        // Validate email
        if (!email) {
          return res.status(400).send({
            error: true,
            message: "Email parameter is required",
          });
        }

        // Validate id
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            error: true,
            message: "Invalid note ID",
          });
        }

        // Check if note exists and belongs to user
        const existingNote = await notesCollection.findOne({
          _id: new ObjectId(id),
          email,
        });

        if (!existingNote) {
          return res.status(404).send({
            error: true,
            message: "Note not found",
          });
        }

        const updateFields = {};

        // Update status fields if provided
        if (isArchived !== undefined) {
          updateFields.isArchived = isArchived;
        }
        if (isTrashed !== undefined) {
          updateFields.isTrashed = isTrashed;
        }

        // Update todo status if provided
        if (isTodo !== undefined) {
          updateFields.isTodo = isTodo;
        }

        // Update todos if provided
        if (todos !== undefined) {
          if (!Array.isArray(todos)) {
            return res.status(400).send({
              error: true,
              message: "Todos must be an array",
            });
          }
          // Validate todo items
          const isValidTodos = todos.every(
            (todo) =>
              todo.id &&
              typeof todo.text === "string" &&
              typeof todo.isCompleted === "boolean"
          );
          if (!isValidTodos) {
            return res.status(400).send({
              error: true,
              message: "Invalid todo items format",
            });
          }
          updateFields.todos = todos;
        }

        // Update content fields if provided
        if (title !== undefined) {
          if (!title.trim()) {
            return res.status(400).send({
              error: true,
              message: "Title cannot be empty",
            });
          }
          updateFields.title = title;
        }

        if (content !== undefined) {
          if (!content.trim()) {
            return res.status(400).send({
              error: true,
              message: "Content cannot be empty",
            });
          }
          updateFields.content = content;
        }

        // Update note
        const result = await notesCollection.updateOne(
          { _id: new ObjectId(id), email },
          { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).send({
            error: true,
            message: "No changes made to note",
          });
        }

        // Get updated note
        const updatedNote = await notesCollection.findOne({
          _id: new ObjectId(id),
          email,
        });

        res.send({
          success: true,
          message: "Note updated successfully",
          note: updatedNote,
        });
      } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).send({
          error: true,
          message: "Error updating note",
        });
      }
    });

    // Get single note
    app.get("/notes/:id", async (req, res) => {
      const { id } = req.params;
      const note = await notesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(note);
    });

    // Delete note
    app.delete("/notes/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const email = req.query.email;

        if (!email || !ObjectId.isValid(id)) {
          return res.status(400).send({
            error: true,
            message: "Invalid request parameters",
          });
        }

        const result = await notesCollection.deleteOne({
          _id: new ObjectId(id),
          email,
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            error: true,
            message: "Note not found",
          });
        }

        res.send({
          success: true,
          message: "Note deleted successfully",
        });
      } catch (error) {
        res.status(500).send({
          error: true,
          message: "Error deleting note",
        });
      }
    });
    //********************* notes apis ************************//
  } catch (error) {
    console.error("MongoDB connection error:", error);
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
