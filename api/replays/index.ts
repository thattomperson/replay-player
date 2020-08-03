
import { NowRequest, NowResponse } from '@vercel/node'
import axios from '../../util/axios';

const client = axios.create({
    baseURL: 'https://ballchasing.com/api/',
    headers: {
        'Authorization': process.env.BALLCHASING_API_KEY || ''
    },
})

type Game = any
type Response = {
    list: Game[]
}

export default async (req: NowRequest, res: NowResponse) => {
    const response = await client.get<Response>('replays?uploader=me')
    res.json(response.data.list)
}