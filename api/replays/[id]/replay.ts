import { NowRequest, NowResponse } from '@vercel/node'
import axios from '../../../util/axios';
import levelup from 'levelup'
import leveldown from 'leveldown'
 
// var db = levelup(leveldown('./node_modules/.cache'))


const client = axios.create({
    baseURL: 'https://ballchasing.com/',
})

type Response = string


export default async (req: NowRequest, res: NowResponse) => {
  let data
  // try {
  //   data = await db.get(req.query.id)
  // } catch (err) {
  //   if (err.notFound) {
  //     console.log('refreshing data')
      const response = await client.get<Response>(`/dyn/replay/${req.query.id}/threejs`)
      const l = 'var replayData='.length
      data = response.data.substr(l, response.data.lastIndexOf(';') - l)  
  //     await db.put(req.query.id, data);
  //   }
  // } finally {
    res.json(JSON.parse(data))
  // }
}