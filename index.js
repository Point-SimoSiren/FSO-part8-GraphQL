const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

mongoose.set('useFindAndModify', false)
const MONGODB_URI = require('./dbconn')

console.log('connecting to database..')

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('Connected to Atlas MongoDB!')
    })
    .catch((error) => {
        console.log('error connection to Atlas MongoDB:', error.message)
    })

const typeDefs = gql`
type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
   type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String]!
    id: ID!
  }
  type Query {
    authorCount: String!
    bookCount: String!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]!
    ): Book
    editAuthor(    
        name: String!    
        setBornTo: Int!  
    ): Author
    createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
    }
  }
`

// __________"Documenting": Print sample queries at startup_____________

const sampleMutationAddBooks = `
mutation {
    addBook(
      title: "Jinja2",
      published: 2016,
      author: "Simo"
      genres: ["programming", "html templates"]
    ) {
      title
      published
      author {name}
          genres
    }
  }
  `
const sampleQueryGetBooks = `
query {
allBooks
  {
    title
    published
    genres
    
    author
    {name
    born}
}
}
`
const sampleMutationEditAuthor = `
mutation {
    editAuthor(
      name: "Simo",
      setBornTo: 1981,
    ) {
     name
      born
    }
  }
  `
console.log('\x1b[36m%s\x1b[0m', 'Sample add new book: ' + sampleMutationAddBooks)
console.log("-------------------")
console.log('\x1b[33m%s\x1b[0m', 'Sample get all books: ' + sampleQueryGetBooks)
console.log("-------------------")
console.log('\x1b[36m%s\x1b[0m', 'Sample edit authors birthyear: ' + sampleMutationEditAuthor)

//____________________________________________________________________

const resolvers = {
    Query: {

        bookCount: () => { return Book.collection.countDocuments() },
        authorCount: () => { return Author.collection.countDocuments() },

        allBooks: async (root, args) => {
            return await Book.find({}).populate('author')
        },

        allAuthors: () => {
            return Author.find({})
        },
    },
    Author: {
        bookCount: (root) => {
            return Book.countDocuments({ author: root })
        }
    },
    Mutation: {
        addBook: async (root, args) => {

            const authorInDb = await Author.findOne({ name: args.author })

            if (authorInDb === null) {
                const author = new Author({ "name": args.author })
                try {
                    await author.save()
                }
                catch (error) {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                }
            }

            const authorObject = await Author.findOne({ name: args.author })
            const bookObject = new Book({ ...args, author: authorObject })

            try {
                return await bookObject.save()

            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            }
        },
        editAuthor: async (root, args) => {

            const authorObj = await Author.findOne({ name: args.name })
            authorObj.born = args.setBornTo

            if (!author) {
                return null
            }

            try {
                return await author.save()
            }
            catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            }
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    setTimeout(() => { console.log('\x1b[33m%s\x1b[0m', 'Hey!') }, 3000)
    setTimeout(() => { console.log('\x1b[33m%s\x1b[0m', 'Scroll up to see sample queries for this service') }, 3000)

    setTimeout(() => { console.log(`\x1b[36m%s\x1b[0m`, `Try queries on ${url}`) }, 4000)

})