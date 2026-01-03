import { FastifyInstance } from 'fastify'
import {z} from 'zod'
import { randomUUID } from 'node:crypto'
import { knexInstance } from '../database'

export async function transactionsRoutes(app: FastifyInstance){
app.get ('/transactions', async () => {
    const transactions = await knexInstance ('transactions').select()
    return { transactions }
})

app.get('/transactions/:id', async (request,reply) => {
    const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
    })
    const { id } = getTransactionParamsSchema.parse(request.params)
    const transaction = await knexInstance( 'transactions').where('id', id).first()
    return {transaction}
})

app.get('/transactions/summary', async () => {
    const summary = await knexInstance('transactions').sum('amount as amount').first()
    return ('summary')
})

app.post ('/transactions', async(request,reply) => {
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
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
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