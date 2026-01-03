import { FastifyInstance } from 'fastify'
import {z} from 'zod'
import { randomUUID } from 'node:crypto'
import { knexInstance } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance){

app.get ('/transactions', {
    preHandler: [checkSessionIdExists],
} ,async (request,reply) => {

    const { sessionId }= request.cookies

    const transactions = await knexInstance ('transactions')
    .where('session_id', sessionId)
    .select()
    return { transactions }
})

app.get('/transactions/:id', {
    preHandler: [checkSessionIdExists],
} ,async (request,) => {
    const { sessionId }= request.cookies
    const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
    })
    const { id } = getTransactionParamsSchema.parse(request.params)
    const transaction = await knexInstance( 'transactions')
    .where({
        session_id: sessionId,
        id,
    })
    .first()
    return {transaction}
})

app.get('/transactions/summary', {
    preHandler: [checkSessionIdExists],
} ,async (request) => {
    const { sessionId }= request.cookies
    const summary = await knexInstance('transactions')
    .where('session_id', sessionId)
    .sum('amount as amount')
    .first()
    return (summary)
})

app.post ('/transactions',async(request,reply) => {
    const createTransactionsBodySchema = z.object ({
     title: z.string(),
     amount: z.number(),
     type: z.enum(['credit', 'debit']),  
    })

const {title, amount, type} = createTransactionsBodySchema.parse (
    request.body,
)

let sessionId = request.cookies.sessionId
if (!sessionId){
    sessionId = randomUUID()

reply.cookie('sessionId', sessionId, {
    path:'/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
})
}

await knexInstance('transactions').insert({
    id: randomUUID(),
    title,
    amount: type == 'credit' ? amount : amount * -1,
    session_id: sessionId,
})
return reply.status(201).send()
})
}