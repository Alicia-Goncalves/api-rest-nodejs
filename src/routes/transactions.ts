import { FastifyInstance } from 'fastify'
import { knexInstance } from '../database'

export async function transactionsRoutes(app: FastifyInstance){
app.get ('/hello', async() => {
const transactions = await knexInstance('transactions')
.where('amount',1000)
.select('*')
return transactions
})
}