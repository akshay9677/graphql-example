import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import db from "./data.js";

let { books, authors } = db || {};

const typeDefs = `#graphql
  type Author {
    id:ID!
    name: String
    email: String
  }

  type Book {
    id:ID!
    title: String
    author: [Author]
  }

  type Query {
    books: [Book]
    book(id:ID!):Book
    authors:[Author]
    author(id:ID!):Author
  }

  type Mutation{
    deleteBooks(id:ID!):[Book]
    addBook(title:String,id:ID!):[Book]
  }
`;

const resolvers = {
  Query: {
    books: () => books,
    book: (_, args) => books.find((book) => book.id === args.id),
    authors: () => authors,
    author: (_, args) => authors.find((author) => author.id === args.id),
  },
  Book: {
    author(parent) {
      return authors.filter((author) => author.book_id.includes(parent.id));
    },
  },
  Mutation: {
    deleteBooks(_, args) {
      books = books.filter((book) => book.id !== args.id);
      return books;
    },
    addBook(_, args) {
      let { id, title } = args || {};
      books = [...books, { title, id }];
      return books;
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
