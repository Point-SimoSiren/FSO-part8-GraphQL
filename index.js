const { ApolloServer, gql } = require('apollo-server')

const { v1: uuid } = require('uuid')

let authors = [
    {
        name: 'Robert Martin',
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952
    },
    {
        name: 'God almighty',
        id: "yha54ab1-344b-11e9-a414-719c6733cf3e",
        born: 0000
    },
    {
        name: 'Martin Fowler',
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963
    },
    {
        name: 'Fyodor Dostoevsky',
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821
    },
    {
        name: 'Joshua Kerievsky', // birthyear not known
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    {
        name: 'Sandi Metz', // birthyear not known
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
]


let books = [
    {
        title: 'Clean Code',
        published: 2008,
        author: 'Robert Martin',
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Agile software development',
        published: 2002,
        author: 'Robert Martin',
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ['agile', 'patterns', 'design']
    },
    {
        title: 'Holy Bible',
        published: 0070,
        author: 'God almighty',
        id: "sta5b6f4-346h-11r9-a416-718c6719cf3s",
        genres: ['life', 'salvation']
    },
    {
        title: 'Refactoring, edition 2',
        published: 2018,
        author: 'Martin Fowler',
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Refactoring to patterns',
        published: 2008,
        author: 'Joshua Kerievsky',
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'patterns']
    },
    {
        title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
        published: 2012,
        author: 'Sandi Metz',
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'design']
    },
    {
        title: 'Crime and punishment',
        published: 1866,
        author: 'Fyodor Dostoevsky',
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'crime']
    },
    {
        title: 'The Demon ',
        published: 1872,
        author: 'Fyodor Dostoevsky',
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'revolution']
    },
]

const typeDefs = gql`
type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
  type Book {
    title: String!
    published: Int
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