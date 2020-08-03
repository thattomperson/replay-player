import { NowRequest, NowResponse } from '@vercel/node'
import axios from '../../../util/axios';

const client = axios.create({
    baseURL: 'https://ballchasing.com/',
})

type Response = string

export default async (req: NowRequest, res: NowResponse) => {
    const response = await client.get<Response>(`/dyn/replay/${req.query.id}/threejs`)
    let data = response.data
    const l = 'var replayData='.length
    data = data.substr(l, data.lastIndexOf(';') - l)
    res.json(JSON.parse(data))
}