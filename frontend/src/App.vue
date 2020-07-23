<template>
    <div id="app">
        <div v-if="user">
            <div class="logged">
                <p>{{ user.username }}</p>
                <button @click="logout">Logout</button>
            </div>
        </div>
        <div v-else>
            <form @submit.prevent="register">
                <fieldset>
                    <legend>Register</legend>
                    <input v-model="registerUsername" type="text" placeholder="Username" required>
                    <p>{{ registerError }}</p>
                    <input v-model="registerPassword" type="password" placeholder="Password" required><br><br>
                    <input type="submit" value="Register">
                </fieldset>
            </form>
            <form @submit.prevent="login">
                <fieldset>
                    <legend>Login</legend>
                    <input v-model="loginUsername" type="text" placeholder="Username" required>
                    <p>{{ loginError }}</p>
                    <input v-model="loginPassword" type="password" placeholder="Password" required><br><br>
                    <input type="submit" value="Login">
                </fieldset>
            </form>
        </div>
    </div>
</template>
<script>
    import gql from 'graphql-tag'

    export default {
        name: 'App',
        apollo: {
            authed: {
                query: gql`query { authed { username } }`,
                update(data) {
                    this.user = data.authed
                }
            },
            userByUsername: {
                query: gql`query ($username: String!){
userByUsername: user(username: $username) { username }
}`,
                variables() {
                    return {username: this.registerUsername}
                },
                fetchPolicy: 'cache-and-network'
            }
        },
        data: () => ({
            user: null,
            registerUsername: '',
            registerPassword: '',
            loginUsername: '',
            loginPassword: '',
            loginError: '',
        }),
        computed: {
            registerError() {
                return this.userByUsername === null ? '' : 'Username already taken'
            }
        },
        methods: {
            async register() {
                if (this.registerError)
                    return
                await this.$apollo.mutate({
                    mutation: gql`mutation ($username: String!, $password: String!) {
register (username: $username, password: $password) {
user { username }
}
}`,
                    variables: {username: this.registerUsername, password: this.registerPassword},
                    update: (store, {data}) => {
                        this.user = data.register.user
                        this.registerUsername = this.registerPassword = ''
                    }
                })
            },
            async login() {
                await this.$apollo.mutate({
                    mutation: gql`mutation ($username: String!, $password: String!) {
login (username: $username, password: $password) {
user { username }
}
}`,
                    variables: {username: this.loginUsername, password: this.loginPassword},
                    update: (store, {data}) => {
                        if (data.login.user !== null) {
                            this.user = data.login.user
                            this.loginError = this.loginUsername = ''
                        } else
                            this.loginError = 'Credentials do not match'
                        this.loginPassword = ''
                    }
                })
            },
            async logout() {
                await this.$apollo.mutate({
                    mutation: gql`mutation { logout { user { id }} }`,
                    update: () => {
                        this.user = null
                    }
                })
            }
        }
    }
</script>
<style>
    form, .logged {
        width: 300px;
        margin: 50px auto;
        text-align: center;
    }
</style>
