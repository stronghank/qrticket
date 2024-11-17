import logger from "./logger"

const crud = async (params) => {
    logger.info(`params: ${JSON.stringify(params, null, 2)}`)
    return fetch(`/api/cms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })
        .then(r => r.json())
        .then(r => {
            return r.data
        }
        )
        .catch(error => {
            logger.error(`error: ${JSON.stringify(error, null, 2)}`)
            return undefined
        })
}
export default crud