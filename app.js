const Koa = require("koa");
const express = require("express");
const { ApolloServer } = require("apollo-server-koa");
const test = require("./test.json")
const { gql } = require("apollo-server-koa");
const OrderRoutes = require("./router/orders-routes");
const appExpress = express();
const db = require("./mySql-connect");
const { resolveSoa } = require("dns");
const { graphqlHTTP } = require('express-graphql');
const session = require("express-session");
const cors = require("cors");
// const cookieSession = require("cookie-session");

const bodyParser = express.urlencoded({ extended: false });
const cookieParser = require("cookie-parser");

// Middleware
appExpress.use(cookieParser());
appExpress.use(bodyParser);
appExpress.use(express.json());

appExpress.use(
  session({
    secret: "wowowowwowo",
    resave: "false",
    saveUninitialized: "false",
  })
);
const { build } = require("@apollo/protobufjs");
const { buildSchema } = require("graphql");


appExpress.get('/', (req, res) => res.end('index'));

// Cors
const whiteList = [
  "undefined",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://gym-project-backend.herokuapp.com",
  "https://wow-gym-1874c.web.app",
  "https://wow-gym-1874c.firebaseapp.com",
];
const corsOptions = {
  credentials: true,
  origin: (origin, cb) => {
    // console.log(origin);
    if (whiteList.indexOf(origin) >= 0) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
};
appExpress.use(cors(corsOptions));

// Router

appExpress.use(bodyParser);

appExpress.use(express.json());

appExpress.use("/orders", OrderRoutes);


async function createCourseQuery() {
  return new Promise(async (succeed, fail) => {

    const sql = "SELECT * FROM `checkoutpage`";
    const [r2] = await db.query(sql, function (err, res) {
      if (err) {
        return fail(err)
      }
      return succeed(res);
    });
  });
}


const data = [
  {
    _id: "5ca16ed7c39e5a03d8ad3547",
    content: "html5",
    completed: false
  },
  {
    _id: "5ca16ee0c39e5a03d8ad3548",
    content: "javascript",
    completed: false
  },
  {
    _id: "5ca16ee5c39e5a03d8ad3549",
    content: "css",
    completed: false
  }
];
const Getcheckoutpage = async (req) => {
  const output = {
    rows: [],
  };
  const sql = "SELECT * FROM `orders`";
  const [r2] = await db.query(sql);
  if (r2) output.rows = r2
  // console.log(output.rows)

  return output.rows;
};


const inserorders = async (req) => {
  const res = JSON.parse(JSON.stringify(req))
  console.log(req)
  const output = {
    rows: [],
  };
  const sql = "INSERT INTO `orders` set ?"
  const [r2] = await db.query(sql, [req]);
  if (r2) output.rows = r2
  // console.log(output.rows)
  return output.rows;
};


// 定義從伺服器獲取資料的graphql方法
const typeDefs = gql`
  type todo {
    _id:ID
    content: String!
    completed: Boolean!
  }
  type some {
    id: ID!
    name: String!
    UserName:String!
  }

  type sqlcontent{
    sld:ID!
    MemberId:String!
    UserName: String!
  }

  type Query {
    todoList: [todo]!
    test:[some]!
    sql:[some]!
  }



  type updateResponse {
    success: Boolean!
    todoList:[todo]!
  }
  type Mutation {
    addTodo(content: String): updateResponse!
  }




`;
const resolvers = {
  Query: {
    todoList: () => data,
    test: () => test,
    sql: async function () {
      let res = await Getcheckoutpage();
      res = JSON.parse(res);
      // console.log("res", res)
      return res;
    }
  }
};
const server = new ApolloServer({
  // 使用gql標籤和字串定義的graphql的DocumentNode
  typeDefs,
  resolvers
});

var schema = buildSchema(`type todo {
  _id: ID!
  content: String!
  completed: Boolean!
}
type some {
  id: ID!
  name: String!
}

type sqlcontent{
  orderId:ID!
  Total:String!
  MemberId:ID!
}

type Query {
  todoList: [todo]!
  test:[some]!
  sql:[sqlcontent]!

}

type updateResponse {
  success: Boolean!
  todoList:[todo]!
  sql:[sqlcontent]!

}
type Mutation {
  addTodo(MemberId:String,Total:String): updateResponse!
}

 `)
  
var root = {
  todoList: () => data,
  sql: async function () {
    const result = await Getcheckoutpage();
    return result
  },
  addTodo: async ({ MemberId, Total }) => {
    console.log(MemberId, Total);
    const info = { MemberId, Total }
    const res = await inserorders(info)
    const data = await Getcheckoutpage();
    return { success: true, sql: data };
  },
}


appExpress.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  pretty: true,
  graphiql: true
}));
const app = new Koa();

// home route
appExpress.use((req, res, next) => res.send("Hi welcome to wow-gym API server 👻"));
// Error handler
appExpress.use((req, res, next) => {
  throw new httpError("Route can't find!", 404);
});

// applyMiddleware將graphql服務連線到koa框架
server.applyMiddleware({ app });

appExpress.listen(process.env.PORT || 5000, () => console.log("server start 🥶"));

app.listen({ port: 4000 }, () =>
  console.log(`? Server ready at http://localhost:4000${server.graphqlPath}`)
);