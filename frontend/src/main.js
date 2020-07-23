import Vue from 'vue'
import App from './App.vue'
import ApolloClient from "apollo-client"
import VueApollo, {ApolloProvider} from 'vue-apollo'
import Cookie from 'js-cookie'
import {createHttpLink} from "apollo-link-http"
import {InMemoryCache} from "apollo-cache-inmemory"
import {ApolloLink, concat} from "apollo-link"

Vue.config.productionTip = false

window.axios = require('axios')
window.axios.defaults.withCredentials = true

function createApp() {
  Vue.use(VueApollo)
  const httpLink = new createHttpLink({
    uri: "http://127.0.0.1:8000/graphql/",
    credentials: 'include',
  })
  const csrfMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext(({headers = {}}) => ({
      headers: {
        ...headers,
        'X-CSRFToken': Cookie.get('csrftoken'),
      }
    }))
    return forward(operation)
  })
  const apolloClient = new ApolloClient({
    link: concat(csrfMiddleware, httpLink),
    cache: new InMemoryCache()
  })
  const apolloProvider = new ApolloProvider({
    defaultClient: apolloClient
  })

  new Vue({
    apolloProvider,
    render: function (h) {
      return h(App)
    },
  }).$mount('#app')
}

if (Cookie.get('csrftoken') === undefined)
  axios.get('http://127.0.0.1:8000/csrf-cookie').then(() => createApp())
else
  createApp()
