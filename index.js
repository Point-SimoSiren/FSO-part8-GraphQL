const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
//const Person = require('./models/person')
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
    author: String!
    id: ID!
    genres: [String!]!
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
        author: String!
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
        authorCount: () => authors.length,
        bookCount: () => books.length,
        allAuthors: () => {
            return authors.map(author => {
                const authorsBooks = books.filter(b => b.author === author.name)
                return { ...author, bookCount: authorsBooks.length }
            })
        },

        allBooks: (root, args) => {
            if (args.author && args.genre) {
                const filtered = books.filter(book => book.author === args.author)
                return filtered.filter(b => b.genres.includes(args.genre))
            }
            else if (args.author) {
                const filteredByAuthor = books.filter(book => book.author === args.author)
                return filteredByAuthor
            }
            else if (args.genre) {
                const filteredByGenre = books.filter(b => b.genres.includes(args.genre))
                return filteredByGenre
            }
            else //If no parameter return all books
                return books
        }
    },
    Mutation: {
        addBook: (root, args) => {
            const book = { ...args, id: uuid() }
            books = books.concat(book)

            const existingAuthor = authors.find(a => a.name === args.author)
            if (!existingAuthor) {
                authors = authors.concat({
                    name: args.author,
                    id: uuid()
                })
            }
            return book
        },
        editAuthor: (root, args) => {
            console.log(...args)
            const year = args.setBornTo
            const authorToChange = authors.find(a => a.name === args.name)

            if (!authorToChange) {
                return null
            }
            authorToChange.born = year
            authors = authors.map(a => {
                return a.id === authorToChange.id ? authorToChange : a
            })
            return authorToChange
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})