from graphene import ObjectType, Schema
import users.schema


class Query(ObjectType, users.schema.Query):
    pass


class Mutation(ObjectType, users.schema.Mutation):
    pass


schema = Schema(query=Query, mutation=Mutation)
