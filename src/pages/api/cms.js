import { createDirectus, staticToken, rest, createItem, readItems, updateItem, deleteItem, aggregate } from '@directus/sdk'
import logger from '@/util/logger'
import jwt from 'jsonwebtoken'

export default async function cms(req, res) {
    const client = createDirectus(process.env.DIRECTUS_URL)
        .with(staticToken(process.env.DIRECTUS_TOKEN))
        .with(rest())

    if (req.method === 'POST') {
        const param = req.body
        logger.info(`param: ${JSON.stringify(param, null, 2)}`)
        switch (param.action) {
            case "R":
                try {
                    const r = await client.request(readItems(param.collection, {
                        filter: param.filter,
                        fields: ['*.*'],
                    }))
                    res.status(200).json({ data: r })
                } catch (e) {
                    logger.error(`e: ${JSON.stringify(e, null, 2)}`)
                }
                break
            case "RD":
                try {
                    logger.info(`param.collection: ${param.collection}`)
                    logger.info(`param.keycolumn: ${param.keycolumn}`)
                    const r = await client.request(
                        aggregate(param.collection, {
                            aggregate: { count: '*' },
                            groupBy: [`${param.keycolumn}`],
                        }
                        )
                    )
                    res.status(200).json({ data: r })
                } catch (e) {
                    logger.error(`e: ${JSON.stringify(e, null, 2)}`)
                }
                break
            case "RS":
                try {
                    logger.info(`param.collection: ${param.collection}`)
                    logger.info(`param.keycolumn: ${param.keycolumn}`)
                    logger.info(`param.aggregatedColumn: ${param.aggregatedColumn}`)
                    logger.info(`param.filter: ${JSON.stringify(param.aggregatedColumn, null, 2)}`)
                    const r = await client.request(
                        aggregate(param.collection, {
                            aggregate: {
                                sum: param.aggregatedColumn
                            },
                            groupBy: param.keycolumn,
                            query: {
                                filter: param.filter,
                                sort: param.sortingColumn
                            }

                        })
                    )

                    res.status(200).json({ data: r })
                } catch (e) {
                    logger.error(`e: ${JSON.stringify(e, null, 2)}`)
                }
                break
            case "C":
                try {
                    jwt.verify(param.ticket_token, process.env.NEXT_PUBLIC_JWTSECRET, async (err, decoded) => {
                        if (err) {
                            logger.error(`error: Invalid Token`)
                            res.status(200).json({ data: null })
                        } else {
                            try {
                                const r = await client.request(createItem(param.collection, {
                                    ...param.data,
                                    ticket_id: decoded.ticket_id,
                                    name: decoded.name,
                                    email: decoded.email,
                                    event_code: decoded.event_code
                                }))
                                res.status(200).json({ data: r })
                            } catch (e) {
                                logger.error(`e: ${JSON.stringify(e, null, 2)}`)
                                res.status(200).json({ data: null })
                            }
                        }
                    })
                } catch (e) {
                    logger.error(`e: ${JSON.stringify(e, null, 2)}`)
                    res.status(200).json({ data: null })
                }
                break
            case "U":
                try {
                    const r = await client.request(updateItem(param.collection, param.id, param.data))
                    logger.info(`r: ${JSON.stringify(r, null, 2)}`)
                    res.status(200).json({ data: r })
                } catch (e) {
                    logger.error(`e: ${JSON.stringify(e, null, 2)}`)
                    res.status(200).json({ status: "CANNOT UPDATE" })
                }
                break
            case "D":
                try {
                    const r = await client.request(deleteItem(param.collection, param.id))
                    logger.info(`r: ${JSON.stringify(r, null, 2)}`)
                    res.status(200).json({ data: r })
                } catch (e) {
                    logger.error(`e: ${JSON.stringify(e, null, 2)}`)
                    res.status(200).json({ status: "CANNOT UPDATE" })
                }
                break
            default:
                logger.warning("Unknown command")
                res.status(200).json({ status: "Unknown command" })
        }
    } else if (req.method === 'GET') {
        logger.warning("NOT POST but GET")
        res.status(200).json({ type: 'GET' })
    } else {
        logger.warning("NOT POST / GET")
        res.status(200).json({ message: '2. Hello from Next.js!' })
    }
}