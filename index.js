const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

const MONGODB_URI = require('./dbconn')

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })


const typeDefs = gql`
type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
  type Book {
    title: String!
    published: Int!
    genres: [String!]!
    id: ID!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author!]! 
    allBooks(author: String, genre: String): [Book]
  }
  type Mutation {
    addBook(
        title: String!
        published: Int!
        genres: [String!]!
    ): Book,
    editAuthor(
        name: String!,
        setBornTo: Int!
    ): Author
  }
`

const resolvers = {
    Query: {
        authorCount: () => Book.collection.countDocuments(),
        bookCount: () => Book.collection.countDocuments(),
        allAuthors: (root, args) => {
            // filters missing
            return Author.find({})
        },
        allBooks: (root, args) => {
            // filters missing
            return Book.find({})
        }
    },
    Mutation: {
        addBook: (root, args) => {
            const book = new Book({ ...args })
            return book.save()
        },
    }
}


const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})